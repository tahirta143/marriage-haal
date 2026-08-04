const pool = require('../config/db');

// GET /api/categories - List all categories with nested packages and sub-services from MySQL
exports.getAllCategories = async (req, res) => {
  try {
    const [cats] = await pool.execute('SELECT * FROM categories ORDER BY id');
    const [pkgs] = await pool.execute('SELECT * FROM category_packages ORDER BY id');
    let subServicesList = [];
    try {
      const [ss] = await pool.execute('SELECT * FROM sub_services ORDER BY id');
      subServicesList = ss;
    } catch (_) {}

    const result = cats.map(c => ({
      ...c,
      subServices: subServicesList.filter(s => s.category_id === c.id),
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
    let subServices = [];
    try {
      const [ss] = await pool.execute('SELECT * FROM sub_services WHERE category_id = ?', [id]);
      subServices = ss;
    } catch (_) {}

    const cat = {
      ...cats[0],
      subServices,
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
    if (!name) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    const pType = ['fixed', 'per_head', 'per_hour'].includes(pricing_type) ? pricing_type : 'fixed';
    const img = image_url || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=800&q=80';

    const [result] = await pool.execute(
      'INSERT INTO categories (name, pricing_type, image_url) VALUES (?, ?, ?)',
      [name, pType, img]
    );

    return res.status(201).json({ success: true, categoryId: result.insertId, message: 'Category created successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create category', error: error.message });
  }
};

// PUT /api/categories/:id - Update category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, pricing_type, image_url } = req.body;

    const fields = [];
    const params = [];

    if (name) { fields.push('name = ?'); params.push(name); }
    if (pricing_type) { fields.push('pricing_type = ?'); params.push(pricing_type); }
    if (image_url) { fields.push('image_url = ?'); params.push(image_url); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(id);

    const [result] = await pool.execute(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    return res.status(200).json({ success: true, message: 'Category updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update category', error: error.message });
  }
};

// DELETE /api/categories/:id - Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.execute('DELETE FROM categories WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    return res.status(200).json({ success: true, message: 'Category deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete category', error: error.message });
  }
};

// SUB-SERVICES MANAGEMENT
exports.createSubService = async (req, res) => {
  try {
    const { id } = req.params; // category_id
    const { name, price, description, image_url } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: 'Sub-service name is required' });
    }

    const subPrice = price ? parseFloat(price) : 15000.00;

    const [result] = await pool.execute(
      'INSERT INTO sub_services (category_id, name, price, description, image_url) VALUES (?, ?, ?, ?, ?)',
      [id, name, subPrice, description || null, image_url || null]
    );

    return res.status(201).json({ success: true, subServiceId: result.insertId, message: 'Sub-service tag created' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to create sub-service', error: error.message });
  }
};

exports.updateSubService = async (req, res) => {
  try {
    const { subId } = req.params;
    const { name, price, description, image_url } = req.body;

    const fields = [];
    const params = [];

    if (name) { fields.push('name = ?'); params.push(name); }
    if (price !== undefined) { fields.push('price = ?'); params.push(parseFloat(price) || 0); }
    if (description !== undefined) { fields.push('description = ?'); params.push(description); }
    if (image_url !== undefined) { fields.push('image_url = ?'); params.push(image_url); }

    if (fields.length === 0) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    params.push(subId);

    const [result] = await pool.execute(`UPDATE sub_services SET ${fields.join(', ')} WHERE id = ?`, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Sub-service not found' });
    }

    return res.status(200).json({ success: true, message: 'Sub-service updated successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update sub-service', error: error.message });
  }
};

exports.deleteSubService = async (req, res) => {
  try {
    const { subId } = req.params;
    const [result] = await pool.execute('DELETE FROM sub_services WHERE id = ?', [subId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: 'Sub-service not found' });
    }
    return res.status(200).json({ success: true, message: 'Sub-service deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete sub-service', error: error.message });
  }
};

// CATEGORY PACKAGES
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

exports.deletePackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    await pool.execute('DELETE FROM category_packages WHERE id = ?', [packageId]);
    return res.status(200).json({ success: true, message: 'Package deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete package', error: error.message });
  }
};
