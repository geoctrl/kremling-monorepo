import { createElement, Fragment, isElement } from '@bikeshaving/crank';
import { newCssState, styleTags  } from '@kremling/core';

export function *Scoped({ css, namespace, children }) {
  if (!css) throw Error(`Kremling's <Scoped /> component requires the 'css' prop.`);
  if (typeof css === 'object' && (
    typeof css.id !== 'string' ||
    typeof css.styles !== 'string')
  ) throw Error(`Kremling's <Scoped /> component requires either a string or an object with "id" and "styles" properties.`);

  let isPostCss,
    rawCss,
    styleRef,
    kremlingAttr,
    kremlingAttrValue;
  try {
    for ({ css } of this) {
      let newCss = newCssState(css, namespace, Scoped.defaultNamespace);
      isPostCss = newCss.isPostCss;
      rawCss = newCss.rawCss;
      styleRef = newCss.styleRef;
      kremlingAttr = newCss.kremlingAttr;
      kremlingAttrValue = newCss.kremlingAttrValue;

      const kremlingChildren = Array.isArray(children)
        ? children.map(child => addKremling(child, kremlingAttr, kremlingAttrValue))
        : addKremling(children, kremlingAttr, kremlingAttrValue);

      yield kremlingChildren;
    }
  } finally {
    if (styleRef && --styleRef.kremlings === 0) {
      delete styleTags[rawCss];
      styleRef.parentNode.removeChild(styleRef);
    }
  }
}

Scoped.defaultNamespace = 'kremling';

function addKremling(child, kremlingAttr, kremlingAttrValue) {
  if (!child) return child;
  if (isElement(child)) {
    if (child.tag.toString() !== 'Symbol(crank.Fragment)') {
      child.props[kremlingAttr] = kremlingAttrValue;
    } else {
      if (child && child.props && child.props.children) {
        child.props.children = Array.isArray(child.props.children)
          ? child.props.children.map(c => addKremling(c, kremlingAttr, kremlingAttrValue))
          : addKremling(child.props.children, kremlingAttr, kremlingAttrValue);
      }
    }
  }
  return child;
}