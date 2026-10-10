import {
  Plane, 
  GraduationCap, 
  Wallet, 
  ShoppingCart, 
  ClipboardList, 
  UtensilsCrossed,
  Baby,
} from 'lucide-react'
import { themeToCssVars, Theme } from './Theme';

export const categories = [
  {
    name: 'Travel Planner App',
    description: 'Build a travel planner app that helps users plan trips, create itineraries, and manage bookings.',
    icon: Plane,
    color: 'indigo',
  },
  {
    name: 'AI Learning Platform',
    description: 'Build an AI-powered learning platform that personalizes courses and tracks user progress.',
    icon: GraduationCap,
    color: 'amber',
  },
  {
    name: 'Finance Tracker',
    description: 'Build a finance tracking app that monitors expenses, budgets, and savings goals.',
    icon: Wallet,
    color: 'slate',
  },
  {
    name: 'E-Commerce Store',
    description: 'Build an e-commerce store that allows users to browse products, add to cart, and checkout securely.',
    icon: ShoppingCart,
    color: 'blue',
  },
  {
    name: 'Smart To-Do Planner',
    description: 'Build a smart to-do planner that helps users organize tasks and improve productivity.',
    icon: ClipboardList,
    color: 'rose',
  },
  {
    name: 'Food Delivery App',
    description: 'Build a food delivery app that lets users order meals and track deliveries in real time.',
    icon: UtensilsCrossed,
    color: 'orange',
  },
  {
    name: 'Kids Learning...',
    description: 'Build a kids learning app with fun, interactive, and age-appropriate educational content.',
    icon: Baby,
    color: 'yellow',
  },
]


export const htmlWrapper = (themeObj: Theme | string, html: string | undefined) => {
  return `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:wght@400;600;700&family=Roboto:wght@300;400;500;700&family=Outfit:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&family=Lora:wght@400;600;700&display=swap" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
  <!-- Tailwind + Iconify -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script src="https://code.iconify.design/iconify-icon/3.0.0/iconify-icon.min.js"></script>
  <style>
    ${themeToCssVars(themeObj)}
    html {
      height: 100% !important;
      overflow: hidden !important;
    }
    body {
      height: 100% !important;
      overflow-y: auto !important;
      overflow-x: hidden !important;
      margin: 0 !important;
      padding: 0 !important;
    }
    /* Override height-restricting layouts on the primary layout wrapper */
    body > * {
      min-height: 100% !important;
      height: auto !important;
      overflow: visible !important;
    }
    /* Prevent absolute/fixed centered panels from clipping in small viewports by turning them into block layout */
    .absolute.top-1/2, .fixed.top-1/2, 
    [class*="top-1/2"][class*="left-1/2"] {
      position: relative !important;
      top: auto !important;
      left: auto !important;
      transform: none !important;
      margin: 2rem auto !important;
    }
    body, p, span, h1, h2, h3, h4, h5, h6, button, input, select, textarea, a {
      font-family: var(--font-family) !important;
    }
    /* Customize scrollbar */
    ::-webkit-scrollbar {
      width: 5px !important;
      height: 5px !important;
      display: block !important;
    }
    ::-webkit-scrollbar-track {
      background: transparent !important;
    }
    ::-webkit-scrollbar-thumb {
      background: rgba(156, 163, 175, 0.4) !important;
      border-radius: 9999px !important;
    }
  </style>
</head>
<body class="bg-[var(--background)] text-[var(--foreground)] w-full">
  ${html ?? ""}
  <script>
    // Navigation logic
    document.addEventListener('click', (e) => {
      const target = e.target.closest('[data-navigate-to]');
      if (target) {
        e.preventDefault();
        window.parent.postMessage({
          type: 'NAVIGATE_TO_SCREEN',
          targetScreenId: target.getAttribute('data-navigate-to')
        }, '*');
      }
    });

    // Clean up layout constraining classes after load
    document.addEventListener("DOMContentLoaded", () => {
      const elements = document.querySelectorAll('*');
      elements.forEach(el => {
        if (el.classList.contains('h-screen')) el.classList.remove('h-screen');
        if (el.classList.contains('min-h-screen')) el.classList.remove('min-h-screen');
        if (el.classList.contains('max-h-screen')) el.classList.remove('max-h-screen');
      });
    });
  </script>
</body>
</html>
      `;
}