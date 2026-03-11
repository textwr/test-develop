const projectId = 'otftjmtrkzrttsmbnnjh';
const publicAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im90ZnRqbXRya3pydHRzbWJubmpoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNDY3ODUsImV4cCI6MjA4ODYyMjc4NX0.PnNoDEazzsHGZm3kjOZYcCcmLTDVefGz9CHhwgXSAag';
const headers = { Authorization: `Bearer ${publicAnonKey}`, 'Content-Type': 'application/json' };
const baseUrl = `https://${projectId}.supabase.co/functions/v1/server`;
const [orders, clients, items, prices] = await Promise.all([
  fetch(`${baseUrl}/orders`, { headers }).then((res) => res.json()),
  fetch(`${baseUrl}/clients`, { headers }).then((res) => res.json()),
  fetch(`${baseUrl}/items`, { headers }).then((res) => res.json()),
  fetch(`${baseUrl}/unit-price-standard`, { headers }).then((res) => res.json()),
]);

function parseNumber(value) {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string' || !value.trim()) return null;
  const parsed = Number(value.replace(/,/g, '').replace(/[^0-9.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

function getText(...values) {
  return values.find((value) => typeof value === 'string' && value.trim()) ?? '-';
}

const rows = orders.flatMap((order, orderIndex) => {
  const client = clients.find((candidate) => candidate.거래처번호 === order.거래처번호 || candidate.거래처명 === order.거래처명);
  const lineItems = Array.isArray(order.수주품목) && order.수주품목.length > 0 ? order.수주품목 : [{}];

  return lineItems.map((line, lineIndex) => {
    const item = items.find((candidate) => candidate.품번 === line.품번 || candidate.품명 === line.품명);
    const meter = parseNumber(line.수주량m);
    const width = parseNumber(line.폭) ?? parseNumber(item?.폭);
    const length = parseNumber(line.길이) ?? parseNumber(item?.길이);
    const gsm = parseNumber(line.평량) ?? parseNumber(item?.평량);
    const squareMeter = parseNumber(line.수주량m2) ?? (meter !== null && width !== null ? Number(((meter * width) / 1000).toFixed(2)) : null);
    const unitPrice = parseNumber(line.단가) ?? null;
    return {
      id: `${order.id ?? orderIndex}-${lineIndex + 1}`,
      orderNumber: getText(order.수주번호),
      orderDate: getText(order.수주일자),
      clientName: getText(order.거래처명, client?.거래처명),
      itemCode: getText(line.품번, item?.품번),
      itemName: getText(line.품명, item?.품명),
      width,
      gsm,
      length,
      meter,
      squareMeter,
      unitPrice,
      amount: squareMeter !== null && unitPrice !== null ? Math.round(squareMeter * unitPrice) : null,
    };
  });
});

console.log(JSON.stringify(rows.slice(0, 6), null, 2));
