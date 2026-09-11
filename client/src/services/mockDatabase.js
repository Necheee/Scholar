export const getApplications = () => {
  const data = localStorage.getItem('mock_applications');
  return data ? JSON.parse(data) : [];
};

export const saveApplication = (app) => {
  const apps = getApplications();
  apps.push({ ...app, id: Date.now() });
  localStorage.setItem('mock_applications', JSON.stringify(apps));
};

export const updateApplicationStatus = (id, newStatus) => {
  const apps = getApplications();
  const index = apps.findIndex(a => a.id === id);
  if (index !== -1) {
    apps[index].status = newStatus;
    localStorage.setItem('mock_applications', JSON.stringify(apps));
  }
};

