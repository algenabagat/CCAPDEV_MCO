// initData.js
const initAppData = {
  users: [
    {
      firstName: 'Algen',
      lastName: 'Abagat',
      email: 'algen.abagat@dlsu.edu.ph',
      password: '12345678',
      accountType: 'student',
      bio: 'Computer Science student interested in web development'
    },
    {
      firstName: 'Maria',
      lastName: 'Santos',
      email: 'maria.santos@dlsu.edu.ph',
      password: 'password123',
      accountType: 'student',
      bio: 'Engineering major specializing in robotics'
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@dlsu.edu.ph',
      password: 'qwerty123',
      accountType: 'technician',
      bio: 'Lab technician with 3 years of experience'
    },
    {
      firstName: 'Anna',
      lastName: 'Cruz',
      email: 'anna.cruz@dlsu.edu.ph',
      password: 'anna1234',
      accountType: 'student',
      bio: 'Multimedia Arts student'
    },
    {
      firstName: 'Michael',
      lastName: 'Tan',
      email: 'michael.tan@dlsu.edu.ph',
      password: 'mike5678',
      accountType: 'technician',
      bio: 'Senior lab technician'
    }
  ]
};

// Initialize localStorage with this data if empty
if (!localStorage.getItem('labReservationData')) {
  localStorage.setItem('labReservationData', JSON.stringify(initAppData));
}

// Function to get current data
function getAppData() {
  return JSON.parse(localStorage.getItem('labReservationData'));
}

export { getAppData };