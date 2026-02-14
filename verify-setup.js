const fs = require('fs');
const path = require('path');

function verify() {
    console.log('--- LeadEnforce Deployment Verification ---');

    // 1. Check Local Files
    const files = [
        'docker-compose.yml',
        'backend/server.js',
        'frontend/app/page.tsx',
        'backend/config/database.js'
    ];

    files.forEach(file => {
        const absolutePath = path.resolve(__dirname, file);
        if (fs.existsSync(absolutePath)) {
            console.log(`✅ File verification: ${file} exists`);

            // 2. Check specific content in docker-compose.yml
            if (file === 'docker-compose.yml') {
                const content = fs.readFileSync(absolutePath, 'utf8');
                if (content.includes('72.61.235.182')) {
                    console.log('✅ Configuration: VPS IP (72.61.235.182) found in docker-compose.yml');
                } else {
                    console.error('❌ Configuration: VPS IP MISSING in docker-compose.yml');
                }
            }

            // 3. Check CORS in server.js
            if (file === 'backend/server.js') {
                const content = fs.readFileSync(absolutePath, 'utf8');
                if (content.includes("origin: '*'")) {
                    console.log("✅ Configuration: CORS allowed headers/origin found");
                } else {
                    console.error('❌ Configuration: CORS settings NOT UPDATED');
                }
            }
        } else {
            console.error(`❌ File verification: ${file} MISSING`);
        }
    });

    console.log('--- End of Verification ---');
}

verify();
