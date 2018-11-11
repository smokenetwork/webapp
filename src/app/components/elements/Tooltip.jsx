import React from 'react';

export default ({children, className, t}) => {
  //return (<LinkWithTooltip tooltipContent={t} tooltipPosition="top" tooltipIndicator={false}>
  //    {children}
  //</LinkWithTooltip>);
  return <span title={t} className={className}>{children}</span>;
}
