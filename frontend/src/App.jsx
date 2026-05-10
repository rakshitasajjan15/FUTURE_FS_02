import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";

function App() {
  const [leads, setLeads] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    source: "",
  });
  const [noteText, setNoteText] = useState({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const API = "http://localhost:5000/api/leads";

  const fetchLeads = async () => {
    const res = await axios.get(API);
    setLeads(res.data);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const addLead = async (e) => {
    e.preventDefault();
    await axios.post(API, formData);
    setFormData({ name: "", email: "", phone: "", source: "" });
    fetchLeads();
  };

  const updateStatus = async (id, status) => {
    await axios.put(`${API}/${id}`, { status });
    fetchLeads();
  };

  const addNote = async (id) => {
    if (!noteText[id]) return;
    await axios.post(`${API}/${id}/notes`, { text: noteText[id] });
    setNoteText({ ...noteText, [id]: "" });
    fetchLeads();
  };

  const deleteLead = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchLeads();
  };

  const total = leads.length;
  const newLeads = leads.filter((lead) => lead.status === "new").length;
  const contacted = leads.filter((lead) => lead.status === "contacted").length;
  const converted = leads.filter((lead) => lead.status === "converted").length;

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.source.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || lead.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <h2>Mini CRM</h2>
        <p>Lead Dashboard</p>
        <p>Manage Clients</p>
        <p>Follow-ups</p>
      </aside>

      <main className="main-content">
        <div className="header">
          <h1>Client Lead Management System</h1>
          <p>Track leads, status, and follow-up notes easily.</p>
        </div>

        <div className="stats">
          <div className="stat-card"><h3>{total}</h3><p>Total Leads</p></div>
          <div className="stat-card"><h3>{newLeads}</h3><p>New</p></div>
          <div className="stat-card"><h3>{contacted}</h3><p>Contacted</p></div>
          <div className="stat-card"><h3>{converted}</h3><p>Converted</p></div>
        </div>

        <section className="form-section">
          <h2>Add New Lead</h2>
          <form onSubmit={addLead}>
            <input name="name" placeholder="Client Name" value={formData.name} onChange={handleChange} required />
            <input name="email" placeholder="Email Address" value={formData.email} onChange={handleChange} required />
            <input name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
            <input name="source" placeholder="Lead Source" value={formData.source} onChange={handleChange} required />
            <button type="submit" className="primary-btn">Add Lead</button>
          </form>
        </section>

        <div className="filter-box">
          <input
            type="text"
            placeholder="Search by name, email, or source"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="converted">Converted</option>
          </select>
        </div>

        <section className="leads-section">
          <h2>All Leads</h2>

          <div className="lead-grid">
            {filteredLeads.map((lead) => (
              <div key={lead._id} className="lead-card">
                <div className="lead-top">
                  <h3>{lead.name}</h3>
                  <span className={`badge ${lead.status}`}>{lead.status}</span>
                </div>

                <p><b>Email:</b> {lead.email}</p>
                <p><b>Phone:</b> {lead.phone || "Not provided"}</p>
                <p><b>Source:</b> {lead.source}</p>

                <div className="actions">
                  <button onClick={() => updateStatus(lead._id, "contacted")}>Contacted</button>
                  <button onClick={() => updateStatus(lead._id, "converted")}>Converted</button>
                  <button className="delete-btn" onClick={() => deleteLead(lead._id)}>Delete</button>
                </div>

                <div className="notes">
                  <h4>Notes / Follow-ups</h4>

                  <div className="note-input">
                    <input
                      placeholder="Add follow-up note"
                      value={noteText[lead._id] || ""}
                      onChange={(e) =>
                        setNoteText({ ...noteText, [lead._id]: e.target.value })
                      }
                    />
                    <button onClick={() => addNote(lead._id)}>Add</button>
                  </div>

                  {lead.notes?.map((note, index) => (
                    <p className="note" key={index}>📝 {note.text}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;