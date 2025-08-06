# Neurodent - Modern Dental Clinic Website

A modern, responsive dental clinic website built with React, Tailwind CSS, and Vite.

## Features

- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI/UX**: Clean, professional design with smooth animations
- **Dental Specializations**: Comprehensive list of dental services
- **Dentist Profiles**: Showcase of top dental professionals
- **Appointment Booking**: Easy-to-use booking interface
- **Contact Information**: Multiple ways to get in touch
- **Career Section**: Join our team opportunities

## Pages

### Home Page
- Hero section with professional imagery
- "Find by Specialization" section with 7 dental specialties
- "Top Dentists to Book" with dentist profiles
- Call-to-action section with statistics
- Professional footer with contact details

### About Us Page
- Company mission and vision
- "Why Choose Us" section with key benefits
- Core values and team statistics
- Professional team imagery

### Contact Us Page
- Complete contact information
- Business hours and location
- Careers section
- Contact form for inquiries

## Technologies Used

- **React 18** - Modern JavaScript library for building user interfaces
- **Tailwind CSS 3** - Utility-first CSS framework
- **React Router Dom** - Client-side routing
- **Vite** - Fast build tool and dev server
- **Professional Imagery** - High-quality stock photos from Unsplash

## Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and visit `http://localhost:3000`

### Build for Production

```bash
npm run build
```

The build files will be generated in the `dist` directory.

## Project Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── About.jsx
│   │   └── Contact.jsx
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── tailwind.config.js
└── vite.config.js
```

## Design Features

- **Color Palette**: Professional blue and white theme
- **Typography**: Inter font family for clean readability
- **Animations**: Smooth hover effects and transitions
- **Icons**: SVG icons for scalable graphics
- **Buttons**: Rounded buttons with hover animations
- **Cards**: Shadow effects for depth and professionalism

## Customization

### Colors
The main color palette can be customized in `tailwind.config.js`:
- Primary Blue: `#2563eb`
- Light Blue: `#dbeafe`
- Gray backgrounds: `#f8fafc`

### Content
All content can be easily modified in the respective page components:
- Dentist profiles in `Home.jsx`
- Specializations list in `Home.jsx`
- Company information in `About.jsx`
- Contact details in `Contact.jsx` and `Footer.jsx`

## Responsive Breakpoints

- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## Performance Features

- Optimized images with proper sizing
- Smooth animations with CSS transitions
- Fast loading with Vite
- Component-based architecture for maintainability

## License

This project is created for Neurodent dental clinic website.

## Support

For support and questions, please contact the development team or refer to the documentation.