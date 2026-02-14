const db = require('../config/database');

// Get theme settings (public - no auth required)
const getThemeSettings = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT setting_value FROM site_settings WHERE setting_key = ?',
      ['theme']
    );

    if (result.rows.length === 0) {
      // Return default theme if not found
      return res.json({
        theme: {
          primary: '#1EA826',
          primaryDark: '#0B7813',
          primaryLight: '#1f7a4d',
          gold: '#FFFFFF',
          goldLight: '#f5e6b0',
          maroon: '#7a1f2b',
          ivory: '#fffaf0'
        }
      });
    }

    res.json({ theme: result.rows[0].setting_value });
  } catch (error) {
    console.error('Error fetching theme settings:', error);
    res.status(500).json({ error: 'Failed to fetch theme settings' });
  }
};

// Update theme settings (admin only)
const updateThemeSettings = async (req, res) => {
  try {
    const { theme } = req.body;

    if (!theme) {
      return res.status(400).json({ error: 'Theme data is required' });
    }

    // Validate required theme properties
    const requiredProps = ['primary', 'primaryDark', 'primaryLight', 'gold', 'goldLight', 'maroon', 'ivory'];
    for (const prop of requiredProps) {
      if (!theme[prop]) {
        return res.status(400).json({ error: `Missing required theme property: ${prop}` });
      }
    }

    // Upsert the theme settings
    await db.query(
      `INSERT INTO site_settings (setting_key, setting_value, updated_at)
       VALUES ('theme', ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(theme), JSON.stringify(theme)]
    );

    const result = await db.query('SELECT setting_value FROM site_settings WHERE setting_key = ?', ['theme']);

    res.json({
      message: 'Theme settings updated successfully',
      theme: result.rows[0].setting_value
    });
  } catch (error) {
    console.error('Error updating theme settings:', error);
    res.status(500).json({ error: 'Failed to update theme settings' });
  }
};

// Get all settings (admin only)
const getAllSettings = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM site_settings ORDER BY setting_key');

    const settings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    res.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

// Update a specific setting (admin only)
const updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!value) {
      return res.status(400).json({ error: 'Setting value is required' });
    }

    await db.query(
      `INSERT INTO site_settings (setting_key, setting_value, updated_at)
       VALUES (?, ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
      [key, JSON.stringify(value), JSON.stringify(value)]
    );

    const result = await db.query('SELECT * FROM site_settings WHERE setting_key = ?', [key]);

    res.json({
      message: 'Setting updated successfully',
      setting: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
};

// Get sidebar settings (admin only)
const getSidebarSettings = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT setting_value FROM site_settings WHERE setting_key = ?',
      ['sidebar_settings']
    );

    if (result.rows.length === 0) {
      // Return default sidebar settings if not found
      const defaultSettings = {
        items: [
          { key: 'dashboard', label: 'Dashboard', path: '/dashboard', enabled: true },
          { key: 'users', label: 'User List', path: '/users', enabled: true },
          { key: 'add-profile', label: 'Add Profile', path: '/add-profile', enabled: true },
          { key: 'bulk-upload', label: 'Bulk Upload', path: '/users/bulk-upload', enabled: true },
          { key: 'set-password', label: 'Set Password', path: '/set-password', enabled: true },
          { key: 'manage-passwords', label: 'Manage Passwords', path: '/manage-passwords', enabled: true },
          { key: 'matches', label: 'Matches', path: '/matches', enabled: true },
          { key: 'assign-match', label: 'Assign Match', path: '/assign-match', enabled: true },
          { key: 'interests', label: 'Interests', path: '/interests', enabled: true },
          { key: 'membership', label: 'Membership Plans', path: '/membership', enabled: true },
          { key: 'settings', label: 'Settings', path: '/settings', enabled: true }
        ]
      };
      return res.json({ settings: defaultSettings });
    }

    // Merge any new default items that are missing from saved settings
    const savedSettings = typeof result.rows[0].setting_value === 'string'
      ? JSON.parse(result.rows[0].setting_value)
      : result.rows[0].setting_value;
    const savedItems = savedSettings.items || [];
    const savedKeys = new Set(savedItems.map(item => item.key));

    const allDefaultItems = [
      { key: 'dashboard', label: 'Dashboard', path: '/dashboard', enabled: true },
      { key: 'users', label: 'User List', path: '/users', enabled: true },
      { key: 'add-profile', label: 'Add Profile', path: '/add-profile', enabled: true },
      { key: 'bulk-upload', label: 'Bulk Upload', path: '/users/bulk-upload', enabled: true },
      { key: 'set-password', label: 'Set Password', path: '/set-password', enabled: true },
      { key: 'manage-passwords', label: 'Manage Passwords', path: '/manage-passwords', enabled: true },
      { key: 'matches', label: 'Matches', path: '/matches', enabled: true },
      { key: 'assign-match', label: 'Assign Match', path: '/assign-match', enabled: true },
      { key: 'interests', label: 'Interests', path: '/interests', enabled: true },
      { key: 'membership', label: 'Membership Plans', path: '/membership', enabled: true },
      { key: 'settings', label: 'Settings', path: '/settings', enabled: true }
    ];

    // Find new items not in saved settings and insert them at their default position
    const newItems = allDefaultItems.filter(item => !savedKeys.has(item.key));
    if (newItems.length > 0) {
      let mergedItems = [...savedItems];
      for (const newItem of newItems) {
        const defaultIndex = allDefaultItems.findIndex(d => d.key === newItem.key);
        const precedingKey = defaultIndex > 0 ? allDefaultItems[defaultIndex - 1].key : null;
        const insertAfterIndex = precedingKey ? mergedItems.findIndex(m => m.key === precedingKey) : -1;
        mergedItems.splice(insertAfterIndex + 1, 0, newItem);
      }
      savedSettings.items = mergedItems;
    }

    res.json({ settings: savedSettings });
  } catch (error) {
    console.error('Error fetching sidebar settings:', error);
    res.status(500).json({ error: 'Failed to fetch sidebar settings' });
  }
};

// Update sidebar settings (admin only)
const updateSidebarSettings = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ error: 'Sidebar items array is required' });
    }

    // Validate each item has required properties
    for (const item of items) {
      if (!item.key || !item.label || !item.path || typeof item.enabled !== 'boolean') {
        return res.status(400).json({ error: 'Each sidebar item must have key, label, path, and enabled properties' });
      }
    }

    const settings = { items };

    // Upsert the sidebar settings
    await db.query(
      `INSERT INTO site_settings (setting_key, setting_value, updated_at)
       VALUES ('sidebar_settings', ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(settings), JSON.stringify(settings)]
    );

    const result = await db.query('SELECT setting_value FROM site_settings WHERE setting_key = ?', ['sidebar_settings']);

    res.json({
      message: 'Sidebar settings updated successfully',
      settings: result.rows[0].setting_value
    });
  } catch (error) {
    console.error('Error updating sidebar settings:', error);
    res.status(500).json({ error: 'Failed to update sidebar settings' });
  }
};

// Get column settings (admin only)
const getColumnSettings = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT setting_value FROM site_settings WHERE setting_key = ?',
      ['column_settings']
    );

    if (result.rows.length === 0) {
      // Return default column settings if not found
      const defaultSettings = {
        userList: [
          { key: 'select', label: 'Select', enabled: true },
          { key: 'user', label: 'User', enabled: true },
          { key: 'contact', label: 'Contact', enabled: true },
          { key: 'age_gender', label: 'Age/Gender', enabled: true },
          { key: 'payment', label: 'Payment', enabled: true },
          { key: 'membership', label: 'Membership', enabled: true },
          { key: 'actions', label: 'Actions', enabled: true }
        ],
        matches: [
          { key: 'select', label: 'Select', enabled: true },
          { key: 'user1', label: 'User 1', enabled: true },
          { key: 'user2', label: 'User 2', enabled: true },
          { key: 'matched_by', label: 'Matched By', enabled: true },
          { key: 'matched_at', label: 'Matched At', enabled: true },
          { key: 'actions', label: 'Actions', enabled: true }
        ],
        interests: [
          { key: 'from_user', label: 'From User', enabled: true },
          { key: 'to_user', label: 'To User', enabled: true },
          { key: 'status', label: 'Status', enabled: true },
          { key: 'sent_at', label: 'Sent At', enabled: true },
          { key: 'actions', label: 'Actions', enabled: true }
        ],
        membership: [
          { key: 'name', label: 'Plan Name', enabled: true },
          { key: 'price', label: 'Price', enabled: true },
          { key: 'duration', label: 'Duration', enabled: true },
          { key: 'features', label: 'Features', enabled: true },
          { key: 'status', label: 'Status', enabled: true },
          { key: 'actions', label: 'Actions', enabled: true }
        ]
      };
      return res.json({ settings: defaultSettings });
    }

    res.json({ settings: result.rows[0].setting_value });
  } catch (error) {
    console.error('Error fetching column settings:', error);
    res.status(500).json({ error: 'Failed to fetch column settings' });
  }
};

// Update column settings (admin only)
const updateColumnSettings = async (req, res) => {
  try {
    const { pageKey, columns } = req.body;

    // Support both old format (userList) and new format (pageKey + columns)
    if (req.body.userList && !pageKey) {
      // Old format - for backwards compatibility
      const { userList } = req.body;
      if (!userList || !Array.isArray(userList)) {
        return res.status(400).json({ error: 'Column settings array is required' });
      }

      for (const item of userList) {
        if (!item.key || !item.label || typeof item.enabled !== 'boolean') {
          return res.status(400).json({ error: 'Each column item must have key, label, and enabled properties' });
        }
      }

      // Get existing settings first
      const existingResult = await db.query(
        'SELECT setting_value FROM site_settings WHERE setting_key = ?',
        ['column_settings']
      );

      let settings = existingResult.rows.length > 0 ? existingResult.rows[0].setting_value : {};
      settings.userList = userList;

      await db.query(
        `INSERT INTO site_settings (setting_key, setting_value, updated_at)
         VALUES ('column_settings', ?, CURRENT_TIMESTAMP)
         ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
        [JSON.stringify(settings), JSON.stringify(settings)]
      );

      const result = await db.query('SELECT setting_value FROM site_settings WHERE setting_key = ?', ['column_settings']);

      return res.json({
        message: 'Column settings updated successfully',
        settings: result.rows[0].setting_value
      });
    }

    // New format - pageKey and columns
    if (!pageKey || !columns || !Array.isArray(columns)) {
      return res.status(400).json({ error: 'pageKey and columns array are required' });
    }

    // Validate each column has required properties
    for (const item of columns) {
      if (!item.key || !item.label || typeof item.enabled !== 'boolean') {
        return res.status(400).json({ error: 'Each column item must have key, label, and enabled properties' });
      }
    }

    // Get existing settings first
    const existingResult = await db.query(
      'SELECT setting_value FROM site_settings WHERE setting_key = ?',
      ['column_settings']
    );

    let settings = existingResult.rows.length > 0 ? existingResult.rows[0].setting_value : {};
    settings[pageKey] = columns;

    // Upsert the column settings
    await db.query(
      `INSERT INTO site_settings (setting_key, setting_value, updated_at)
       VALUES ('column_settings', ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(settings), JSON.stringify(settings)]
    );

    const result = await db.query('SELECT setting_value FROM site_settings WHERE setting_key = ?', ['column_settings']);

    res.json({
      message: 'Column settings updated successfully',
      settings: result.rows[0].setting_value
    });
  } catch (error) {
    console.error('Error updating column settings:', error);
    res.status(500).json({ error: 'Failed to update column settings' });
  }
};

// Get module settings (public - for client/admin to check enabled modules)
const getModuleSettings = async (req, res) => {
  try {
    const result = await db.query(
      'SELECT setting_value FROM site_settings WHERE setting_key = ?',
      ['module_settings']
    );

    if (result.rows.length === 0) {
      // Return default module settings if not found - all modules enabled by default
      const defaultSettings = {
        modules: [
          { key: 'membership', label: 'Membership', description: 'Membership plans and badges', enabled: false },
        ]
      };
      return res.json({ settings: defaultSettings });
    }

    res.json({ settings: result.rows[0].setting_value });
  } catch (error) {
    console.error('Error fetching module settings:', error);
    res.status(500).json({ error: 'Failed to fetch module settings' });
  }
};

// Update module settings (superadmin only)
const updateModuleSettings = async (req, res) => {
  try {
    const { modules } = req.body;

    if (!modules || !Array.isArray(modules)) {
      return res.status(400).json({ error: 'Modules array is required' });
    }

    // Validate each module has required properties
    for (const module of modules) {
      if (!module.key || !module.label || typeof module.enabled !== 'boolean') {
        return res.status(400).json({ error: 'Each module must have key, label, and enabled properties' });
      }
    }

    const settings = { modules };

    // Upsert the module settings
    await db.query(
      `INSERT INTO site_settings (setting_key, setting_value, updated_at)
       VALUES ('module_settings', ?, CURRENT_TIMESTAMP)
       ON DUPLICATE KEY UPDATE setting_value = ?, updated_at = CURRENT_TIMESTAMP`,
      [JSON.stringify(settings), JSON.stringify(settings)]
    );

    const result = await db.query('SELECT setting_value FROM site_settings WHERE setting_key = ?', ['module_settings']);

    res.json({
      message: 'Module settings updated successfully',
      settings: result.rows[0].setting_value
    });
  } catch (error) {
    console.error('Error updating module settings:', error);
    res.status(500).json({ error: 'Failed to update module settings' });
  }
};

module.exports = {
  getThemeSettings,
  updateThemeSettings,
  getAllSettings,
  updateSetting,
  getSidebarSettings,
  updateSidebarSettings,
  getColumnSettings,
  updateColumnSettings,
  getModuleSettings,
  updateModuleSettings
};
