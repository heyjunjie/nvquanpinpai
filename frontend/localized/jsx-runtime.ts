// One component tree and design system; only native display text is localized.
// API identifiers, component data and option values retain their original values.
import {jsx as reactJsx,jsxs as reactJsxs,Fragment} from 'react/jsx-runtime';
import {localizeProps} from '../localized-props.mjs';
export {localizeProps};
export {Fragment};
export type {JSX} from 'react/jsx-runtime';
export const jsx=(type:any,props:any,key?:any)=>reactJsx(type,localizeProps(type,props),key);
export const jsxs=(type:any,props:any,key?:any)=>reactJsxs(type,localizeProps(type,props),key);
