/**
 * YRB Farm — API data situs (ulasan, promo, kontak) di atas Google Sheets.
 *
 * Cara pakai singkat (detail di README):
 * 1. Buka spreadsheet → Extensions → Apps Script → tempel file ini.
 * 2. Project Settings → Script Properties → tambah API_SECRET (acak, panjang).
 * 3. Deploy → New deployment → Web app → Execute as: Me →
 *    Who has access: Anyone → Deploy → salin URL /exec.
 * 4. Set di Vercel: SHEET_API_URL (URL /exec) dan SHEET_API_TOKEN (= API_SECRET).
 */

var SCHEMAS = {
  reviews: ['id', 'name', 'city', 'rating', 'message', 'status', 'createdAt'],
  promos: ['id', 'title', 'description', 'badge', 'validUntil', 'active', 'createdAt'],
  settings: ['key', 'value']
};

var SETTING_KEYS = [
  'waNumber',
  'phoneDisplay',
  'email',
  'farmAddress',
  'officeAddress',
  'announcement'
];

function secret_() {
  return PropertiesService.getScriptProperties().getProperty('API_SECRET') || '';
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function safeEqual_(a, b) {
  a = String(a || '');
  b = String(b || '');
  if (!a || !b || a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function cell_(value) {
  var s = value === null || value === undefined ? '' : String(value);
  s = s.replace(/[\u0000-\u001F]/g, ' ').trim().slice(0, 1200);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function sheet_(name) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(name);
  var headers = SCHEMAS[name];
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, headers.length).setFontWeight('bold');
    return sh;
  }
  var first = sh.getRange(1, 1, 1, headers.length).getValues()[0];
  var matches = headers.every(function (h, i) {
    return String(first[i] || '') === h;
  });
  if (!matches && sh.getLastRow() === 0) {
    sh.appendRow(headers);
  }
  return sh;
}

function rows_(name) {
  var sh = sheet_(name);
  var headers = SCHEMAS[name];
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  var values = sh.getRange(2, 1, lastRow - 1, headers.length).getValues();
  return values
    .filter(function (row) {
      return String(row[0] || '').trim() !== '';
    })
    .map(function (row) {
      var obj = {};
      headers.forEach(function (h, i) {
        obj[h] = row[i];
      });
      return obj;
    });
}

function findRow_(name, id) {
  var sh = sheet_(name);
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return -1;
  var ids = sh.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2;
  }
  return -1;
}

function upsert_(name, item) {
  var sh = sheet_(name);
  var headers = SCHEMAS[name];
  var values = headers.map(function (h) {
    return cell_(item[h]);
  });
  var row = findRow_(name, item.id);
  if (row > 0) {
    sh.getRange(row, 1, 1, headers.length).setValues([values]);
  } else {
    sh.appendRow(values);
  }
  return item;
}

function delete_(name, id) {
  var row = findRow_(name, id);
  if (row > 0) sheet_(name).deleteRow(row);
  return { ok: true };
}

function settings_() {
  var out = {};
  var rows = rows_('settings');
  rows.forEach(function (row) {
    var key = String(row.key || '');
    if (SETTING_KEYS.indexOf(key) >= 0) out[key] = String(row.value || '');
  });
  return out;
}

function saveSettings_(values) {
  var sh = sheet_('settings');
  var existing = rows_('settings');
  SETTING_KEYS.forEach(function (key) {
    var value = cell_(values[key] || '');
    var found = -1;
    for (var i = 0; i < existing.length; i++) {
      if (String(existing[i].key) === key) {
        found = i + 2;
        break;
      }
    }
    if (found > 0) {
      sh.getRange(found, 2).setValue(value);
    } else {
      sh.appendRow([key, value]);
    }
  });
  return settings_();
}

function byNewest_(a, b) {
  return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
}

function publicData_() {
  var reviews = rows_('reviews')
    .filter(function (r) {
      return String(r.status) === 'published';
    })
    .sort(byNewest_)
    .slice(0, 30)
    .map(function (r) {
      return {
        id: String(r.id),
        name: String(r.name),
        city: String(r.city),
        rating: Number(r.rating) || 5,
        message: String(r.message),
        status: 'published',
        createdAt: String(r.createdAt)
      };
    });

  var promos = rows_('promos')
    .filter(function (p) {
      return p.active === true || String(p.active).toLowerCase() === 'true';
    })
    .sort(byNewest_)
    .map(function (p) {
      return {
        id: String(p.id),
        title: String(p.title),
        description: String(p.description),
        badge: String(p.badge),
        validUntil: String(p.validUntil),
        active: true,
        createdAt: String(p.createdAt)
      };
    });

  return { reviews: reviews, promos: promos, settings: settings_() };
}

function adminData_() {
  var reviews = rows_('reviews')
    .sort(byNewest_)
    .map(function (r) {
      var status = String(r.status || 'pending');
      if (['published', 'pending', 'hidden'].indexOf(status) < 0) status = 'pending';
      return {
        id: String(r.id),
        name: String(r.name),
        city: String(r.city),
        rating: Number(r.rating) || 5,
        message: String(r.message),
        status: status,
        createdAt: String(r.createdAt)
      };
    });

  var promos = rows_('promos')
    .sort(byNewest_)
    .map(function (p) {
      return {
        id: String(p.id),
        title: String(p.title),
        description: String(p.description),
        badge: String(p.badge),
        validUntil: String(p.validUntil),
        active: p.active === true || String(p.active).toLowerCase() === 'true',
        createdAt: String(p.createdAt)
      };
    });

  return { reviews: reviews, promos: promos, settings: settings_() };
}

function doGet(e) {
  try {
    var params = (e && e.parameter) || {};
    if (!safeEqual_(params.token, secret_())) {
      return json_({ ok: false, error: 'unauthorized' });
    }
    var action = String(params.action || '');
    if (action === 'ping') return json_({ ok: true, data: { pong: true } });
    if (action === 'public.get') return json_({ ok: true, data: publicData_() });
    if (action === 'admin.list') return json_({ ok: true, data: adminData_() });
    return json_({ ok: false, error: 'unknown_action' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(15000);
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (!safeEqual_(body.token, secret_())) {
      return json_({ ok: false, error: 'unauthorized' });
    }
    var action = String(body.action || '');
    var payload = body.payload || {};

    switch (action) {
      case 'review.create': {
        var review = {
          id: cell_(payload.id),
          name: cell_(payload.name),
          city: cell_(payload.city),
          rating: Number(payload.rating) || 5,
          message: cell_(payload.message),
          status: 'pending',
          createdAt: cell_(payload.createdAt) || new Date().toISOString()
        };
        upsert_('reviews', review);
        return json_({ ok: true, data: review });
      }
      case 'review.upsert': {
        var r = {
          id: cell_(payload.id),
          name: cell_(payload.name),
          city: cell_(payload.city),
          rating: Number(payload.rating) || 5,
          message: cell_(payload.message),
          status: ['published', 'pending', 'hidden'].indexOf(String(payload.status)) >= 0
            ? String(payload.status)
            : 'pending',
          createdAt: cell_(payload.createdAt) || new Date().toISOString()
        };
        upsert_('reviews', r);
        return json_({ ok: true, data: r });
      }
      case 'review.delete': {
        delete_('reviews', cell_(payload.id));
        return json_({ ok: true });
      }
      case 'promo.upsert': {
        var promo = {
          id: cell_(payload.id),
          title: cell_(payload.title),
          description: cell_(payload.description),
          badge: cell_(payload.badge),
          validUntil: cell_(payload.validUntil),
          active: payload.active === true || String(payload.active) === 'true',
          createdAt: cell_(payload.createdAt) || new Date().toISOString()
        };
        upsert_('promos', promo);
        return json_({ ok: true, data: promo });
      }
      case 'promo.delete': {
        delete_('promos', cell_(payload.id));
        return json_({ ok: true });
      }
      case 'settings.save': {
        return json_({ ok: true, data: saveSettings_(payload) });
      }
      default:
        return json_({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  } finally {
    try {
      lock.releaseLock();
    } catch (err) {
      // ignore
    }
  }
}
