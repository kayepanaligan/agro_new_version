const fs = require('fs');
const path = require('path');

// List of controllers to update with their model names
const controllers = [
    { name: 'CommodityController', model: 'commodities', view: 'commodities' },
    { name: 'VarietyController', model: 'varieties', view: 'varieties' },
    { name: 'ProgramController', model: 'programs', view: 'programs' },
    { name: 'FundingSourceController', model: 'funding-sources', view: 'funding-sources' },
    { name: 'AssistanceCategoryController', model: 'assistance-categories', view: 'assistance-categories' },
    { name: 'AllocationTypeController', model: 'allocation-types', view: 'allocation-types' },
    { name: 'EligibilityRuleController', model: 'eligibility-rules', view: 'eligibility-rules' },
    { name: 'AllocationPolicyController', model: 'allocation-policies', view: 'allocation-policies' },
    { name: 'DamageCategoryController', model: 'damage-categories', view: 'damage-categories' },
    { name: 'DamageTypeController', model: 'damage-types', view: 'damage-types' },
    { name: 'CropMonitoringCategoryController', model: 'monitoring-categories', view: 'monitoring-categories' },
    { name: 'OrganizationController', model: 'organizations', view: 'organizations' },
    { name: 'UnitOfMeasureController', model: 'unit-of-measures', view: 'unit-of-measures' },
    { name: 'FarmerEligibilityController', model: 'farmer-eligibilities', view: 'farmer-eligibilities' },
];

const controllersDir = path.join(__dirname, '../app/Http/Controllers/Admin');

controllers.forEach(controller => {
    const filePath = path.join(controllersDir, `${controller.name}.php`);
    
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Find and replace Inertia::render('admin/XXX' with dynamic view
        const pattern = new RegExp(`Inertia::render\\('admin/${controller.view}'`, 'g');
        const replacement = `Inertia::render(request()->is('super-admin/*') ? 'super_admin/${controller.view}' : 'admin/${controller.view}'`;
        
        if (pattern.test(content)) {
            content = content.replace(pattern, replacement);
            fs.writeFileSync(filePath, content, 'utf8');
            console.log(`✓ Updated ${controller.name}`);
        } else {
            console.log(`- No changes needed for ${controller.name}`);
        }
    } else {
        console.log(`✗ Controller not found: ${controller.name}`);
    }
});

console.log('\nDone! All controllers updated.');
