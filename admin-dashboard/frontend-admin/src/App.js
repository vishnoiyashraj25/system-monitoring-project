// frontend-admin/src/App.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [machines, setMachines] = useState([]);
  const [filterOS, setFilterOS] = useState("");
  const [onlyIssues, setOnlyIssues] = useState(false);

  useEffect(() => {
    fetchData();
  }, [filterOS, onlyIssues]);
  
  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:3000/api/machines/filter", {
        params: {
          os: filterOS || undefined,
          issue: onlyIssues || undefined,
        },
      });
      setMachines(res.data);
      console.log("Fetched machines:", res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  const exportCSV = () => {
  const headers = [
    "Machine ID",
    "OS",
    "Disk Encrypted",
    "OS Up To Date",
    "Antivirus Enabled",
    "Sleep OK",
    "Last Seen"
  ];

  const rows = machines.map((m) => [
    m.machine_id || "N/A",
    m.os || "N/A",
    m.disk_encrypted ? "yes" : "no",
    m.os_up_to_date ? "yes" : "no",
    m.antivirus_enabled ? "yes" : "no",
    m.sleep_setting_ok ? "yes" : "no",
    new Date(m.timestamp).toLocaleString()
  ]);

  const csvContent =
    "data:text/csv;charset=utf-8," +
    [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "machine_status_report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};


  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>

      <div className="flex gap-4 mb-6">
        <select
          className="border p-2 rounded"
          value={filterOS}
          onChange={(e) => setFilterOS(e.target.value)}
        >
          <option value="">All OS</option>
          <option value="Windows">Windows</option>
          <option value="macOS">macOS</option>
          <option value="Linux">Linux</option>
        </select>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={onlyIssues}
            onChange={() => setOnlyIssues(!onlyIssues)}
          />
          Only Show Issues
        </label>
        <button
          className="ml-auto bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={exportCSV}
        >
          Export CSV
        </button>
      </div>

      <div className="overflow-auto">
        <table className="w-full border border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="border px-4 py-2">Machine ID</th>
              <th className="border px-4 py-2">OS</th>
              <th className="border px-4 py-2">Disk Encrypted</th>
              <th className="border px-4 py-2">OS Up To Date</th>
              <th className="border px-4 py-2">Antivirus Enabled</th>
              <th className="border px-4 py-2">Sleep OK</th>
              <th className="border px-4 py-2">Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {machines.map((m, idx) => (
              <tr
                key={idx}
                className={
                  !m.disk_encrypted ||
                  !m.os_up_to_date ||
                  !m.antivirus_enabled ||
                  !m.sleep_setting_ok
                    ? "bg-red-100"
                    : ""
                }
              >
                <td className="border px-4 py-2">{m.machine_id}</td>
                <td className="border px-4 py-2">{m.os}</td>
                <td className="border px-4 py-2">{m.disk_encrypted ? "✅" : "❌"}</td>
                <td className="border px-4 py-2">{m.os_up_to_date ? "✅" : "❌"}</td>
                <td className="border px-4 py-2">{m.antivirus_enabled ? "✅" : "❌"}</td>
                <td className="border px-4 py-2">{m.sleep_setting_ok ? "✅" : "❌"}</td>
                <td className="border px-4 py-2">{new Date(m.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default App;
