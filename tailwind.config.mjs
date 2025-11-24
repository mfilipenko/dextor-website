/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			colors: {
				primary: '#FF6B00', // Orange for construction/machinery
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
