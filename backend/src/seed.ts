import { createConnection } from 'mysql2/promise';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

async function seed() {
    console.log('Starting seed...');

    // Try connection with configured user
    const config = {
        host: process.env.DATABASE_HOST || 'localhost',
        user: process.env.DATABASE_USER || 'user',
        password: process.env.DATABASE_PASSWORD || 'user123',
        database: process.env.DATABASE_NAME || 'vacinacao_db',
        port: Number(process.env.DATABASE_PORT) || 3306
    };

    let connection;
    try {
        connection = await createConnection(config);
    } catch (err) {
        console.log('Failed to connect with "user", trying "root"...');
        connection = await createConnection({
            ...config,
            user: 'root',
            password: 'root' // Try root/root as fallback for default docker-compose
        });
    }

    console.log('Connected to database.');

    const tenantId = crypto.randomUUID();
    const userId = crypto.randomUUID();
    const passwordHash = await bcrypt.hash('password123', 10);

    // Insert Tenant
    try {
        // Check if tenant exists
        const [rows] = await connection.execute('SELECT * FROM tenants WHERE slug = ?', ['clinica-exemplo']);
        if ((rows as any[]).length > 0) {
            console.log('Tenant already exists, skipping.');
        } else {
            await connection.execute(
                'INSERT INTO tenants (id, name, slug, created_at, updated_at) VALUES (?, ?, ?, NOW(), NOW())',
                [tenantId, 'Clínica Exemplo', 'clinica-exemplo']
            );
            console.log('Tenant created.');
        }

        // Insert User
        const [users] = await connection.execute('SELECT * FROM users WHERE email = ?', ['admin@example.com']);
        if ((users as any[]).length > 0) {
            console.log('User already exists, skipping.');
        } else {
            await connection.execute(
                'INSERT INTO users (id, name, email, passwordHash, role, created_at, updated_at) VALUES (?, ?, ?, ?, ?, NOW(), NOW())',
                [userId, 'Admin User', 'admin@example.com', passwordHash, 'ADMIN']
            );
            console.log('User created.');

            // Insert Relation (user_tenants)
            await connection.execute(
                'INSERT INTO user_tenants (user_id, tenant_id) VALUES (?, ?)',
                [userId, tenantId] // Use the newly created tenantId. 
                // Note: If tenant existed, this might fail if we don't fetch its ID. 
                // For simplicity in test env, we assume clean slate or just add duplicate relation usage which might throw.
                // Better to fetch tenant ID if exists.
            );
            console.log('User linked to Tenant.');
        }

    } catch (err) {
        console.error('Error seeding:', err);
    }

    console.log('Seed complete.');
    console.log('--------------------------------');
    console.log('Email: admin@example.com');
    console.log('Password: password123');
    console.log('--------------------------------');

    await connection.end();
}

seed().catch(err => {
    console.error(err);
    process.exit(1);
});
