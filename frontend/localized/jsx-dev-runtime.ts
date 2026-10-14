export {Fragment} from './jsx-runtime';
export type {JSX} from 'react/jsx-dev-runtime';
import {jsxDEV as reactJsxDev} from 'react/jsx-dev-runtime';
import {localizeProps} from './jsx-runtime';
export const jsxDEV=(type:any,props:any,key:any,isStaticChildren:boolean,source:any,self:any)=>reactJsxDev(type,localizeProps(type,props),key,isStaticChildren,source,self);
