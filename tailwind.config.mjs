/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary: {
					DEFAULT: '#E85D00', // Darker orange for better contrast on white
					light: '#FF6B00', // Lighter orange for backgrounds
					dark: '#C75000', // Even darker for buttons with white text
				},
				secondary: '#1F2937', // Dark gray
				accent: '#F3F4F6', // Light gray
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			}
		},
	},
	plugins: [],
}
