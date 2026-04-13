const fs = require('fs');
const path = require('path');

// List of modules to create with their admin page names
const modules = [
    'commodities',
    'varieties',
    'programs',
    'funding-sources',
    'assistance-categories',
    'allocation-types',
    'eligibility-rules',
    'allocation-policies',
    'damage-categories',
    'damage-types',
    'monitoring-categories',
    'organizations',
    'unit-of-measures',
    'farmer-eligibilities',
];

const superAdminDir = path.join(__dirname, '../resources/js/pages/super_admin');
const adminDir = path.join(__dirname, '../resources/js/pages/admin');

modules.forEach(module => {
    const adminFile = path.join(adminDir, `${module}.tsx`);
    const superAdminFile = path.join(superAdminDir, `${module}.tsx`);

    if (fs.existsSync(adminFile)) {
        let content = fs.readFileSync(adminFile, 'utf8');

        // Replace breadcrumbs href
        content = content.replace(/href: '\/admin\//g, "href: '/super-admin/");
        
        // Replace router calls
        content = content.replace(/router\.(post|put|delete|get)\('\/admin\//g, "router.$1('/super-admin/");
        content = content.replace(/router\.(post|put|delete|get)\(`\/admin\//g, "router.$1(`/super-admin/");
        
        // Replace route() helper calls if any
        content = content.replace(/route\('admin\./g, "route('super-admin.");

        fs.writeFileSync(superAdminFile, content, 'utf8');
        console.log(`✓ Created ${module}.tsx`);
    } else {
        console.log(`✗ Admin file not found: ${module}.tsx`);
    }
});

console.log('\nDone! All super admin pages created.');
