// initData.js
const initAppData = {
  users: [
    {
      firstName: 'Lebron',
      lastName: 'James',
      email: 'lebron.james@dlsu.edu.ph',
      password: '12345678',
      accountType: 'Student',
      bio: 'Computer Science student interested in web development',
      profileImage: 'img/bron.jpg'
    },
    {
      firstName: 'Shrek',
      lastName: 'Ogre',
      email: 'shrek.ogre@dlsu.edu.ph',
      password: 'password123',
      accountType: 'Student',
      bio: 'Engineering major specializing in robotics',
      profileImage: 'img/shrek.jpg'
    },
    {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@dlsu.edu.ph',
      password: 'qwerty123',
      accountType: 'Technician',
      bio: 'Lab technician with 3 years of experience',
    },
    {
      firstName: 'Anna',
      lastName: 'Cruz',
      email: 'anna.cruz@dlsu.edu.ph',
      password: 'anna1234',
      accountType: 'Student',
      bio: 'Hi',
    },
    {
      firstName: 'Michael',
      lastName: 'Tan',
      email: 'michael.tan@dlsu.edu.ph',
      password: 'mike5678',
      accountType: 'Technician',
      bio: 'Senior Lab technician',
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