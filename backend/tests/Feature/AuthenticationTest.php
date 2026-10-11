<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    /**
     * 1. User can register.
     */
    public function test_user_can_register_successfully(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Usman Tariq',
            'email' => 'usman@example.com',
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email', 'role'],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'usman@example.com',
            'name' => 'Usman Tariq',
            'role' => 'customer',
        ]);
    }

    /**
     * 2. New registration always creates a customer.
     */
    public function test_new_registration_always_creates_a_customer(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Bilal Ahmed',
            'email' => 'bilal@example.com',
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
        ]);

        $response->assertStatus(201);
        $this->assertEquals('customer', $response->json('user.role'));

        $user = User::where('email', 'bilal@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('customer', $user->role);
        $this->assertTrue($user->isCustomer());
        $this->assertFalse($user->isAdmin());
    }

    /**
     * 3. Registration cannot create an admin (role payload is ignored/overridden).
     */
    public function test_registration_cannot_create_an_admin(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Hacker Admin',
            'email' => 'hacker@example.com',
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
            'role' => 'admin', // Malicious attempt to escalate role
        ]);

        $response->assertStatus(201);
        $this->assertEquals('customer', $response->json('user.role'));

        $user = User::where('email', 'hacker@example.com')->first();
        $this->assertNotNull($user);
        $this->assertEquals('customer', $user->role);
        $this->assertFalse($user->isAdmin());
    }

    /**
     * 4. Duplicate email is rejected.
     */
    public function test_duplicate_email_is_rejected(): void
    {
        User::factory()->create([
            'email' => 'existing@example.com',
        ]);

        $response = $this->postJson('/api/register', [
            'name' => 'Another User',
            'email' => 'existing@example.com',
            'password' => 'SecurePass123',
            'password_confirmation' => 'SecurePass123',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * 5. Invalid registration data is rejected.
     */
    public function test_invalid_registration_data_is_rejected(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => '',
            'email' => 'not-an-email',
            'password' => 'short',
            'password_confirmation' => 'different',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    /**
     * 6. Password is saved as a secure hash in the database.
     */
    public function test_password_is_securely_hashed(): void
    {
        $plainPassword = 'PlainPassword123!';

        $this->postJson('/api/register', [
            'name' => 'Security Test',
            'email' => 'security@example.com',
            'password' => $plainPassword,
            'password_confirmation' => $plainPassword,
        ]);

        $user = User::where('email', 'security@example.com')->first();
        $this->assertNotNull($user);
        $this->assertNotEquals($plainPassword, $user->password);
        $this->assertTrue(Hash::check($plainPassword, $user->password));
    }

    /**
     * 7. User can log in with valid credentials.
     */
    public function test_user_can_login_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'loginuser@example.com',
            'password' => Hash::make('MySecretPassword123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'loginuser@example.com',
            'password' => 'MySecretPassword123',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'name', 'email', 'role'],
            ]);
    }

    /**
     * 8. Invalid credentials are rejected without leaking details.
     */
    public function test_invalid_credentials_are_rejected(): void
    {
        User::factory()->create([
            'email' => 'validuser@example.com',
            'password' => Hash::make('CorrectPassword123'),
        ]);

        $response = $this->postJson('/api/login', [
            'email' => 'validuser@example.com',
            'password' => 'WrongPassword',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    /**
     * 9. Authenticated user can access /api/user.
     */
    public function test_authenticated_user_can_access_current_user_profile(): void
    {
        $user = User::factory()->create([
            'name' => 'Profile User',
            'email' => 'profile@example.com',
            'role' => 'customer',
        ]);

        Sanctum::actingAs($user);

        $response = $this->getJson('/api/user');

        $response->assertStatus(200)
            ->assertJson([
                'user' => [
                    'id' => $user->id,
                    'name' => 'Profile User',
                    'email' => 'profile@example.com',
                    'role' => 'customer',
                ],
            ]);
    }

    /**
     * 10. Unauthenticated user cannot access /api/user.
     */
    public function test_unauthenticated_user_cannot_access_current_user_profile(): void
    {
        $response = $this->getJson('/api/user');

        $response->assertStatus(401);
    }

    /**
     * 11. Authenticated user can log out.
     */
    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();

        Sanctum::actingAs($user);

        $response = $this->postJson('/api/logout');

        $response->assertStatus(200)
            ->assertJson(['message' => 'Logged out successfully']);
    }

    /**
     * 12. Customer cannot access /api/admin/test (returns 403).
     */
    public function test_customer_cannot_access_admin_test_endpoint(): void
    {
        $customer = User::factory()->customer()->create();

        Sanctum::actingAs($customer);

        $response = $this->getJson('/api/admin/test');

        $response->assertStatus(403)
            ->assertJson([
                'message' => 'Forbidden. Admin access required.',
            ]);
    }

    /**
     * 13. Admin can access /api/admin/test (returns 200).
     */
    public function test_admin_can_access_admin_test_endpoint(): void
    {
        $admin = User::factory()->admin()->create();

        Sanctum::actingAs($admin);

        $response = $this->getJson('/api/admin/test');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Admin access granted',
            ]);
    }

    /**
     * 14. Unauthenticated user cannot access /api/admin/test (returns 401).
     */
    public function test_unauthenticated_user_cannot_access_admin_test_endpoint(): void
    {
        $response = $this->getJson('/api/admin/test');

        $response->assertStatus(401);
    }

    /**
     * 15. Password and sensitive attributes are never included in API responses.
     */
    public function test_passwords_are_never_included_in_api_responses(): void
    {
        $regResponse = $this->postJson('/api/register', [
            'name' => 'Privacy Check',
            'email' => 'privacy@example.com',
            'password' => 'SafePass1234',
            'password_confirmation' => 'SafePass1234',
        ]);

        $this->assertNotNull($regResponse->json('user'));
        $this->assertArrayNotHasKey('password', $regResponse->json('user'));
        $this->assertArrayNotHasKey('remember_token', $regResponse->json('user'));

        $loginResponse = $this->postJson('/api/login', [
            'email' => 'privacy@example.com',
            'password' => 'SafePass1234',
        ]);

        $this->assertNotNull($loginResponse->json('user'));
        $this->assertArrayNotHasKey('password', $loginResponse->json('user'));
        $this->assertArrayNotHasKey('remember_token', $loginResponse->json('user'));

        $user = User::where('email', 'privacy@example.com')->first();
        Sanctum::actingAs($user);

        $userResponse = $this->getJson('/api/user');

        $this->assertNotNull($userResponse->json('user'));
        $this->assertArrayNotHasKey('password', $userResponse->json('user'));
        $this->assertArrayNotHasKey('remember_token', $userResponse->json('user'));
    }

    /**
     * 16. New customer is NOT automatically subscribed to marketing emails, and email is NOT auto-verified.
     */
    public function test_user_is_not_automatically_subscribed_to_marketing_emails(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Consent Check',
            'email' => 'consent.check@example.com',
            'password' => 'SafePass1234',
            'password_confirmation' => 'SafePass1234',
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'consent.check@example.com')->first();
        $this->assertNotNull($user);
        // Explicit consent required — never automatically subscribed
        $this->assertFalse($user->marketing_consent);
        // Manually entered emails are NOT treated as automatically verified
        $this->assertNull($user->email_verified_at);
    }

    /**
     * 17. User can explicitly opt in to marketing emails.
     */
    public function test_user_can_explicitly_opt_in_to_marketing_emails(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'OptIn Check',
            'email' => 'optin.check@example.com',
            'password' => 'SafePass1234',
            'password_confirmation' => 'SafePass1234',
            'marketing_consent' => true,
        ]);

        $response->assertStatus(201);

        $user = User::where('email', 'optin.check@example.com')->first();
        $this->assertNotNull($user);
        $this->assertTrue($user->marketing_consent);
    }
}

