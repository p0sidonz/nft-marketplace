import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		vite: {
			server: {
				fs: {
					allow: ['hardhat']
				}
			}
		},
		adapter: adapter()
	}
};

export default config;
