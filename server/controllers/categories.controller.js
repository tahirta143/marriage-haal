const pool = require('../config/db');

// GET /api/categories - List all categories with nested packages from MySQL
exports.getAllCategories = async (req, res) => {
  try {
    const [cats] = await pool.execute('SELECT * FROM categories ORDER BY id');
    const [pkgs] = await pool.execute('SELECT * FROM category_packages ORDER BY id');

    const result = cats.map(c => ({
      ...c,
      packages: pkgs
        .filter(p => p.category_id === c.id)
        .map(p => ({
          ...p,
          details: typeof p.details === 'string' ? JSON.parse(p.details) : (p.details || [])
        }))
    }));

    return res.status(200).json({ success: true, count: result.length, categories: result });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch categories from database', error: error.message });
  }
};

// GET /api/categories/:id - Get single category details
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const [cats] = await pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
    if (cats.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    const [pkgs] = await pool.execute('SELECT * FROM category_packages WHERE category_id = ?', [id]);
    const cat = {
      ...cats[0],
      packages: pkgs.map(p => ({
        ...p,
        details: typeof p.details === 'string' ? JSON.parse(p.details) : (p.details || [])
      }))
    };

    return res.status(200).json({ success: true, category: cat });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Database error', error: error.message });
  }
};

// GET /api/categories/:id/sub-services - Fetch child sub-services for parent category
exports.getSubServices = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.execute('SELECT * FROM sub_services WHERE category_id = ? ORDER BY id ASC', [id]);
    return res.status(200).json({ success: true, count: rows.length, subServices: rows });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch sub-services', error: error.message });
  }
};

// POST /api/categories - Create new category
exports.createCategory = async (req, res) => {
  try {
    const { name, pricing_type, image_url } = req.body;
    if (!name || !pricing_type) {
      return res.status(400).json({ success: false, message: 'Category name and pricing_type are required' });
    }

    const img = image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80';

    const [result] = await pool.execute(
      'INSERT INTO categories (name, pricing_type, image_url) VALUES (?, ?, ?)',
      [name, pricing_type, img]
    );

    return res.status(201).json({ success: true, categoryId: result.insertId, message: 'Category created successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
};

// POST /api/categories/:id/packages - Create package under category
exports.createPackage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, details, image_url } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ success: false, message: 'Package name and price are required' });
    }

    const detailsArray = Array.isArray(details) ? details : (details ? [details] : []);
    const img = image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80';

    const [result] = await pool.execute(
      'INSERT INTO category_packages (category_id, name, price, details, image_url) VALUES (?, ?, ?, ?, ?)',
      [id, name, price, JSON.stringify(detailsArray), img]
    );

    return res.status(201).json({ success: true, packageId: result.insertId, message: 'Package created successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create package', error: error.message });
  }
};

// PUT /api/categories/packages/:packageId - Update package
exports.updatePackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const { name, price, details, image_url } = req.body;

    const detailsArray = Array.isArray(details) ? details : (details ? [details] : []);

    await pool.execute(
      'UPDATE category_packages SET name = ?, price = ?, details = ?, image_url = ? WHERE id = ?',
      [name, price, JSON.stringify(detailsArray), image_url || null, packageId]
    );

    return res.status(200).json({ success: true, message: 'Package updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update package', error: error.message });
  }
};

// DELETE /api/categories/packages/:packageId - Delete package
exports.deletePackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    await pool.execute('DELETE FROM category_packages WHERE id = ?', [packageId]);
    return res.status(200).json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete package', error: error.message });
  }
};
