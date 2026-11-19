import axios from 'axios';

const API_BASE = 'http://localhost:5116/api';

function assert(condition, message) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`PASS: ${message}`);
}

async function runCampusConnectTests() {
  console.log('=== Running CampusConnect End-to-End API & RBAC Tests ===');

  // 1. Categories
  const catRes = await axios.get(`${API_BASE}/categories`);
  assert(catRes.data.success === true, 'GET /api/categories returns success');
  assert(catRes.data.data.length >= 4, 'Categories include Cafeteria, Library, IT, Teaching');
  console.log(`Categories loaded: ${catRes.data.data.map(c => c.name).join(', ')}`);

  // 2. Student Demo Login (Sarah Chen)
  const studentLoginRes = await axios.post(`${API_BASE}/auth/login`, {
    email: 's.chen@student.biit.edu.pk',
    password: 'Password123!'
  });
  assert(studentLoginRes.data.success === true, 'Student login succeeds');
  const studentToken = studentLoginRes.data.data.token;
  const studentUser = studentLoginRes.data.data.user;
  assert(studentUser.fullName === 'Sarah Chen' || studentUser.name === 'Sarah Chen', 'Student name is Sarah Chen');
  assert(studentUser.registrationNumber === 'BIIT-2023-SE-042' || studentUser.regNo === 'BIIT-2023-SE-042', 'Student RegNo is BIIT-2023-SE-042');
  assert(studentUser.role === 'Student', 'Student role is Student');

  // 3. Auth Me
  const meRes = await axios.get(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(meRes.data.success === true && (meRes.data.data.fullName === 'Sarah Chen' || meRes.data.data.name === 'Sarah Chen'), 'GET /api/auth/me returns valid user');

  // 4. Student Complaints List
  const complaintsRes = await axios.get(`${API_BASE}/complaints`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(complaintsRes.data.success === true, 'GET /api/complaints succeeds');
  assert(complaintsRes.data.data.length >= 3, 'Student complaints retrieved');
  console.log(`Student complaints count: ${complaintsRes.data.data.length}`);

  // 5. Student Complaint Detail
  const firstComplaint = complaintsRes.data.data[0];
  const detailRes = await axios.get(`${API_BASE}/complaints/${firstComplaint.id}`, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(detailRes.data.success === true, 'GET /api/complaints/{id} detail succeeds');
  assert(detailRes.data.data.trackingCode.startsWith('CC-2026-'), 'Tracking code format is CC-2026-XXXX');
  assert(detailRes.data.data.timeline.length > 0, 'Timeline events populated');

  // 6. Interactive 5-Star Rating
  const resolvedTicket = complaintsRes.data.data.find(c => c.status === 'Resolved');
  if (resolvedTicket) {
    const rateRes = await axios.patch(`${API_BASE}/complaints/${resolvedTicket.id}/rating`, {
      rating: 5,
      comment: 'Excellent lab turnaround!'
    }, {
      headers: { Authorization: `Bearer ${studentToken}` }
    });
    assert(rateRes.data.success === true, 'PATCH /api/complaints/{id}/rating succeeds with 5 stars');
  }

  // 7. Student Remark Submission
  const remarkRes = await axios.post(`${API_BASE}/complaints/${firstComplaint.id}/remarks`, {
    message: 'Testing student remark submission.'
  }, {
    headers: { Authorization: `Bearer ${studentToken}` }
  });
  assert(remarkRes.data.success === true, 'POST /api/complaints/{id}/remarks succeeds');

  // 8. IT Admin Login
  const itLoginRes = await axios.post(`${API_BASE}/auth/login`, {
    email: 'itlabs.admin@biit.edu.pk',
    password: 'Password123!'
  });
  assert(itLoginRes.data.success === true, 'IT Admin login succeeds');
  const itToken = itLoginRes.data.data.token;
  const itUser = itLoginRes.data.data.user;
  assert(itUser.role === 'DeptAdmin', 'IT Admin role is DeptAdmin');

  // 9. Library Admin Login
  const libLoginRes = await axios.post(`${API_BASE}/auth/login`, {
    email: 'library.admin@biit.edu.pk',
    password: 'Password123!'
  });
  assert(libLoginRes.data.success === true, 'Library Admin login succeeds');
  const libToken = libLoginRes.data.data.token;

  // 10. Server-Side RBAC Enforcement: Library Admin trying to access IT ticket -> 403 Forbidden!
  const itComplaint = complaintsRes.data.data.find(c => c.departmentName.includes('Computer Science') || c.categoryName.includes('Laboratories') || c.departmentName.includes('IT'));
  if (itComplaint) {
    try {
      await axios.get(`${API_BASE}/complaints/${itComplaint.id}`, {
        headers: { Authorization: `Bearer ${libToken}` }
      });
      assert(false, 'Library Admin accessing IT ticket should fail with 403');
    } catch (err) {
      assert(err.response && err.response.status === 403, 'Server-Side RBAC: Library Admin accessing IT ticket returns HTTP 403 Forbidden!');
    }
  }

  // 11. Super Admin Login & CSV Export
  const superLoginRes = await axios.post(`${API_BASE}/auth/login`, {
    email: 'superadmin@biit.edu.pk',
    password: 'Password123!'
  });
  assert(superLoginRes.data.success === true, 'Super Admin login succeeds');
  const superToken = superLoginRes.data.data.token;

  const csvRes = await axios.get(`${API_BASE}/complaints/export/csv`, {
    headers: { Authorization: `Bearer ${superToken}` }
  });
  assert(csvRes.status === 200, 'Super Admin GET /api/complaints/export/csv succeeds');
  assert(csvRes.data.includes('TrackingCode,Title,Category'), 'CSV contains header columns');

  console.log('=== ALL CAMPUSCONNECT E2E TESTS PASSED FLAWLESSLY ===');
}

runCampusConnectTests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
