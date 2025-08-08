// Teste le mode DRY-RUN (sans SMTP configuré)
jest.spyOn(console, 'log').mockImplementation(() => {});

const notification = require('../src/services/notificationService');

describe('notificationService (DRY-RUN)', () => {
  beforeAll(() => {
    // s'assurer qu'aucune variable SMTP n'est configurée pour le test
    delete process.env.SMTP_HOST;
    delete process.env.SMTP_PORT;
    delete process.env.SMTP_USER;
    delete process.env.SMTP_PASS;
  });

  it('notifyAccessRevoked ne jette pas et log DRY-RUN', async () => {
    await expect(notification.notifyAccessRevoked({ ownerEmail: 'o@ex.com', userEmail: 'u@ex.com', propertyName: 'A', reason: 'R' })).resolves.toBeUndefined();
  });

  it('notifyBatteryLow ne jette pas', async () => {
    await expect(notification.notifyBatteryLow({ ownerEmail: 'o@ex.com', propertyName: 'A', batteryLevel: 10 })).resolves.toBeUndefined();
  });

  it('notifyExpiredAttempt ne jette pas', async () => {
    await expect(notification.notifyExpiredAttempt({ ownerEmail: 'o@ex.com', propertyName: 'A' })).resolves.toBeUndefined();
  });
});

