const crypto = require('node:crypto');

// ADMIN-ONLY FILE. Never include this script in the installer or send it to clients.
const PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDgRq2CxRlW74Jm
PL1eAvRyLhDMWjciKn668vBC3dsWxAWx5E/iomVpL+EgC3HWwPznuEwh8cZ8MjCh
1O480GvsejOnIyKiR0LXn4yyxser5j0N5twXzf+CTJpL3/+Vy/09m9WasgVyNVTP
8rYwD78MipU5dxDfZGHllvK6MSBsWApifGyDIovXNH0u5Vv3xcuKv+DSZTwSyRC/
/FMCxtImTcfh42tkZdPDVuK7RZvAEBIvA3nIiJBxwdOXw6Fq/XtTll+qUuZzk60R
eORmVjQf6bEW5o9nrkDu66dsk2uqszTT1E4giTjOhItX5Jv0tzhuC+fsYkkWF3m3
LLDG8tYNAgMBAAECggEAE1xWly7foJ8dcSj2Kfr0UjUC0zlIgCUN+qKFNiiDxMPY
QAKXGNfvDDULaKJESgcv7er9e4KtIUSN6TKB/HL7lhb4hYmlcD/Zl9aYpUg+rWq7
Q4t13YI1d/CX80vbevl4m4xr1KZgjPronujzbFO3qOP/vM24AajfQJwWyRb7lw6b
OghHf+5oOAG+r+2zAyKaRPqlpetHFhXATovkKrIptvDqiUv/CTA1/JIx83BvJ0Rf
UuHLHb+QdZg19rOeVBb+roNS+ttQ7ptGnzXGoG+yuf5NhntccQgiho2CUbELEwXu
OU8LOSjR2XAwWF5mwTtwPkqxRsK9+3RYdC/CQGN/GwKBgQD0dl+OeE+tU+GDZgMV
W6y1TPSrZbzur4OlSkFkfr0E3wRSUb+X1gyhUyyp07AtEtpOql1Ck7CeqlewAo7e
SJx+XGyrxBNtKJ/S+FCHG+iobtqVl3tM3O++k/vHRBnvxSp1HcCwO9ABCxEcaMlh
xtTwGIqolXrCHMcsvj8SyuSH9wKBgQDq3Gkt8ZQfrSi588NZsKLak3SG9htN2LOP
9oB1oJk5iJlTb2Z8mbexaygYNKYrpxmjEAkb36zs3LgxKWUh/aTlRuR+YixjU9t5
g3QqPVA9OFThratWQMe3BHDSAi1LS6PMB+vReAgnzSHyz8KCe27f15P0f6ag0z5u
Y0clemG5GwKBgFeg5vfm4Ii8/KVhN9G8HtiOUVXvDh5xA7uINpCTbaYFW0M20nrW
24gojGYD368IhwCTyQJIdpMpdG0/PX8ogBA7iSi5DE2gtkmlgRgtROS7d9cPib8v
ozCpUyNGohV0k5ePpraFejYlhWitlyJZZ5L4+RsdGffi4PKE748I84pZAoGBAMQq
MwO32qOWiwS+ELWSLoPoU5UCbI3Z6SjemC8nY7PFX2NsEasS7XYX7ZZCK2UcnfIv
y5vneFUiigot7BW2+Iq0atcRAsg324IkBNve+G0Z5vPUjd5uHyHDaMRQIyrX08jv
+MytuAoecTOQyoMXu+Tk9+Ro1nFP375t15f7HzJvAoGAFuxkEYhmmiFLn2DMMgjC
nZZtCx89z0I3/xaxYATEi+OYFPbsLKnpyCAp2iNucXxxhmyIvrTw8So/f2dBAPdk
X2R2jqLLB8PBQ6dr/uETWaqe+1+zWGbVquRuStpfS1urGA3Xm+0K/JGg+OQnwnpb
yo1ZXJEUKmQ5ODTrfz6WPvo=
-----END PRIVATE KEY-----`;

const [machineId, plan, ...customerParts] = process.argv.slice(2);
const monthsByPlan = { '1m': 1, '6m': 6, '1y': 12 };
if (!machineId || !monthsByPlan[plan]) {
  console.error('Usage: node scripts/generate-license.cjs MACHINE-ID 1m|6m|1y "Customer name"');
  process.exit(1);
}
const issued = new Date();
const expires = new Date(issued);
expires.setUTCMonth(expires.getUTCMonth() + monthsByPlan[plan]);
const payload = {
  v: 1,
  licenseId: crypto.randomUUID(),
  machineId: machineId.toUpperCase(),
  plan,
  customer: customerParts.join(' ') || 'KiranaMitra Customer',
  issuedAt: issued.toISOString(),
  expiresAt: expires.toISOString()
};
const payloadPart = Buffer.from(JSON.stringify(payload)).toString('base64url');
const signature = crypto.sign('RSA-SHA256', Buffer.from(payloadPart), PRIVATE_KEY).toString('base64url');
console.log(`${payloadPart}.${signature}`);
console.error(`Created ${plan} license for ${payload.customer}; expires ${expires.toISOString().slice(0, 10)}`);
