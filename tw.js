// tw.js
import { create } from 'twrnc';

// 👇 Automatically picks up tailwind.config.js
const tw = create(require('./tailwind.config.js'));

export default tw;
