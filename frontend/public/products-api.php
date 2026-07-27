<?php
declare(strict_types=1);

/*
 * Emergency catalog API for static hosting with PHP/cPanel.
 * Change TOFF_PRODUCTS_ADMIN_PASSWORD in the hosting environment when possible.
 * If environment variables are not available, change the fallback password below
 * before publishing.
 */

$adminPassword = getenv('TOFF_PRODUCTS_ADMIN_PASSWORD') ?: 'ToffBrasil2026!';
$tokenSecret = getenv('TOFF_PRODUCTS_TOKEN_SECRET') ?: hash_file('sha256', __FILE__);
$dbPath = __DIR__ . DIRECTORY_SEPARATOR . 'products-db.json';

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

function send_json(int $status, array $payload): void
{
    http_response_code($status);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

function request_route(): string
{
    $route = $_GET['route'] ?? '';

    if (is_string($route) && $route !== '') {
        return '/' . ltrim($route, '/');
    }

    $pathInfo = $_SERVER['PATH_INFO'] ?? '';
    if (is_string($pathInfo) && $pathInfo !== '') {
        return '/' . ltrim($pathInfo, '/');
    }

    return '/';
}

function request_body(): array
{
    $raw = file_get_contents('php://input') ?: '';
    if ($raw === '') {
        return [];
    }

    $data = json_decode($raw, true);
    if (!is_array($data)) {
        send_json(400, ['message' => 'JSON invalido.']);
    }

    return $data;
}

function read_products(string $dbPath): ?array
{
    if (!file_exists($dbPath)) {
        return null;
    }

    $raw = file_get_contents($dbPath);
    if ($raw === false || trim($raw) === '') {
        return [];
    }

    $products = json_decode($raw, true);
    return is_array($products) ? $products : [];
}

function write_products(string $dbPath, array $products): void
{
    $tempPath = $dbPath . '.tmp';
    $json = json_encode($products, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);

    if ($json === false || file_put_contents($tempPath, $json, LOCK_EX) === false) {
        send_json(500, ['message' => 'Nao foi possivel salvar o catalogo.']);
    }

    if (!rename($tempPath, $dbPath)) {
        @unlink($tempPath);
        send_json(500, ['message' => 'Nao foi possivel atualizar o catalogo.']);
    }
}

function base64_url_encode(string $value): string
{
    return rtrim(strtr(base64_encode($value), '+/', '-_'), '=');
}

function base64_url_decode(string $value): string
{
    $padding = strlen($value) % 4;
    if ($padding > 0) {
        $value .= str_repeat('=', 4 - $padding);
    }

    $decoded = base64_decode(strtr($value, '-_', '+/'), true);
    return $decoded === false ? '' : $decoded;
}

function create_token(string $email, string $secret): string
{
    $payload = json_encode([
        'email' => $email,
        'role' => 'MANAGER',
        'exp' => time() + 60 * 60 * 24 * 30,
    ], JSON_UNESCAPED_SLASHES);

    if ($payload === false) {
        send_json(500, ['message' => 'Nao foi possivel criar sessao.']);
    }

    $body = base64_url_encode($payload);
    $signature = hash_hmac('sha256', $body, $secret);

    return 'catalog.' . $body . '.' . $signature;
}

function bearer_token(): string
{
    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';

    if ($header === '' && function_exists('apache_request_headers')) {
        $headers = apache_request_headers();
        $header = $headers['Authorization'] ?? $headers['authorization'] ?? '';
    }

    if (!is_string($header) || stripos($header, 'Bearer ') !== 0) {
        return '';
    }

    return trim(substr($header, 7));
}

function require_manager(string $secret): void
{
    $token = bearer_token();
    $parts = explode('.', $token);

    if (count($parts) !== 3 || $parts[0] !== 'catalog') {
        send_json(401, ['message' => 'Login de gerente necessario.']);
    }

    $expected = hash_hmac('sha256', $parts[1], $secret);
    if (!hash_equals($expected, $parts[2])) {
        send_json(401, ['message' => 'Sessao de gerente invalida.']);
    }

    $payload = json_decode(base64_url_decode($parts[1]), true);
    if (!is_array($payload) || ($payload['role'] ?? '') !== 'MANAGER' || (int)($payload['exp'] ?? 0) < time()) {
        send_json(401, ['message' => 'Sessao de gerente expirada.']);
    }
}

function normalize_text(string $value): string
{
    $normalized = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $value);
    $normalized = $normalized === false ? $value : $normalized;
    return strtolower($normalized);
}

function product_id(string $name): string
{
    $slug = preg_replace('/[^a-z0-9]+/', '-', normalize_text($name));
    $slug = trim((string)$slug, '-');
    $slug = substr($slug !== '' ? $slug : 'produto', 0, 50);

    return 'global-' . $slug . '-' . bin2hex(random_bytes(4));
}

function product_from_payload(array $payload, ?array $current = null): array
{
    $name = trim((string)($payload['name'] ?? ''));
    $description = trim((string)($payload['description'] ?? ''));
    $image = (string)($payload['image'] ?? '');
    $price = (float)($payload['price'] ?? 0);
    $stock = (int)($payload['estoque'] ?? 0);

    if ($name === '' || $description === '' || $image === '') {
        send_json(400, ['message' => 'Nome, descricao e imagem sao obrigatorios.']);
    }

    if ($price <= 0) {
        send_json(400, ['message' => 'Preco invalido.']);
    }

    if ($stock < 0) {
        send_json(400, ['message' => 'Estoque invalido.']);
    }

    $now = gmdate('c');

    return [
        'id' => $current['id'] ?? product_id($name),
        'ativo' => true,
        'name' => $name,
        'description' => $description,
        'price' => $price,
        'image' => $image,
        'images' => is_array($payload['images'] ?? null) ? $payload['images'] : [],
        'featured' => (bool)($payload['featured'] ?? false),
        'categoria' => (string)($payload['categoria'] ?? 'FILAMENTOS'),
        'marca' => trim((string)($payload['marca'] ?? '')),
        'type' => trim((string)($payload['type'] ?? '')),
        'estoque' => $stock,
        'status' => (string)($payload['status'] ?? 'DISPONIVEL'),
        'codigoBarras' => trim((string)($payload['codigoBarras'] ?? '')),
        'createdAt' => $current['createdAt'] ?? $now,
        'updatedAt' => $now,
    ];
}

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$route = request_route();

try {
    if ($method === 'GET' && ($route === '/' || $route === '/health')) {
        send_json(200, ['ok' => true, 'service' => 'Toff Brasil catalog']);
    }

    if ($method === 'POST' && $route === '/auth/login') {
        $body = request_body();
        $email = strtolower(trim((string)($body['email'] ?? 'gerente@toffbrasil.com')));
        $password = (string)($body['password'] ?? '');

        if ($password === '' || !hash_equals($adminPassword, $password)) {
            send_json(401, ['message' => 'E-mail ou senha invalidos.']);
        }

        $token = create_token($email, $tokenSecret);
        send_json(200, [
            'token' => $token,
            'refreshToken' => $token,
            'user' => [
                'email' => $email,
                'name' => 'Gerente Toff Brasil',
                'role' => 'MANAGER',
            ],
        ]);
    }

    if ($method === 'GET' && $route === '/products') {
        $products = read_products($dbPath);
        send_json(200, [
            'initialized' => is_array($products),
            'products' => $products ?? [],
        ]);
    }

    if ($method === 'PUT' && $route === '/products/seed') {
        $currentProducts = read_products($dbPath);
        if (is_array($currentProducts) && count($currentProducts) > 0) {
            send_json(200, ['products' => $currentProducts]);
        }

        $body = request_body();
        $products = is_array($body['products'] ?? null) ? $body['products'] : [];
        write_products($dbPath, $products);
        send_json(200, ['products' => $products]);
    }

    if ($method === 'POST' && $route === '/products') {
        require_manager($tokenSecret);
        $products = read_products($dbPath) ?? [];
        $product = product_from_payload(request_body());
        array_unshift($products, $product);
        write_products($dbPath, $products);
        send_json(201, $product);
    }

    if (preg_match('#^/products/([^/]+)$#', $route, $matches)) {
        require_manager($tokenSecret);
        $id = rawurldecode($matches[1]);
        $products = read_products($dbPath) ?? [];
        $index = -1;

        foreach ($products as $productIndex => $product) {
            if (($product['id'] ?? '') === $id) {
                $index = $productIndex;
                break;
            }
        }

        if ($index < 0) {
            send_json(404, ['message' => 'Produto nao encontrado.']);
        }

        if ($method === 'PUT') {
            $products[$index] = product_from_payload(request_body(), $products[$index]);
            write_products($dbPath, $products);
            send_json(200, $products[$index]);
        }

        if ($method === 'DELETE') {
            array_splice($products, $index, 1);
            write_products($dbPath, $products);
            send_json(200, ['ok' => true]);
        }
    }

    send_json(404, ['message' => 'Rota nao encontrada.']);
} catch (Throwable $error) {
    send_json(500, ['message' => 'Falha inesperada no catalogo.']);
}
