const client = require('prom-client');

// Registre dédié à l'app (évite conflits)
const register = new client.Registry();
client.collectDefaultMetrics({ register });

// HTTP
const httpRequestsTotal = new client.Counter({
  name: 'http_requests_total',
  help: 'Total requêtes HTTP',
  labelNames: ['method', 'route', 'status']
});

const httpRequestDurationSeconds = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Durée des requêtes HTTP (s)',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.01, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

register.registerMetric(httpRequestsTotal);
register.registerMetric(httpRequestDurationSeconds);

// Business
const accessesCreatedTotal = new client.Counter({
  name: 'business_accesses_created_total',
  help: 'Accès créés (total)',
  labelNames: ['propertyId']
});
register.registerMetric(accessesCreatedTotal);

const accessValidateTotal = new client.Counter({
  name: 'business_access_validate_total',
  help: 'Tentatives de validation de code',
  labelNames: ['result'] // valid | expired | not_started | invalid
});
register.registerMetric(accessValidateTotal);

const lockStatusChecksTotal = new client.Counter({
  name: 'business_lock_status_checks_total',
  help: 'Vérifications de statut de serrure',
  labelNames: ['propertyId']
});
register.registerMetric(lockStatusChecksTotal);

// Middleware HTTP
function httpMetricsMiddleware(req, res, next) {
  const method = req.method;
  const route = req.route?.path || req.path || req.originalUrl || 'unknown';
  const end = httpRequestDurationSeconds.startTimer({ method, route });
  res.on('finish', () => {
    const status = String(res.statusCode);
    httpRequestsTotal.inc({ method, route, status });
    end({ method, route, status });
  });
  next();
}

// Helpers business
function incAccessCreated(propertyId) {
  if (propertyId) accessesCreatedTotal.inc({ propertyId });
}

function incAccessValidate(result) {
  accessValidateTotal.inc({ result });
}

function incLockStatus(propertyId) {
  if (propertyId) lockStatusChecksTotal.inc({ propertyId });
}

module.exports = {
  register,
  httpMetricsMiddleware,
  incAccessCreated,
  incAccessValidate,
  incLockStatus,
};

