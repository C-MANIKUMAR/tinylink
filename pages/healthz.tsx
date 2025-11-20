export default function HealthPage() {
  return (
    <pre style={{ padding: 24 }}>{JSON.stringify({ ok: true, version: "1.0" }, null, 2)}</pre>
  );
}
