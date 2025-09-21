import React from 'react';

export const ActivityIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12.75 3.03v.568c0 .334.148.65.405.864l1.068.89c.442.369.535 1.01.216 1.49l-1.08.902a2.25 2.25 0 01-1.421.65H12a2.25 2.25 0 00-2.25 2.25v.568c0 .41.34.75.75.75h1.5a.75.75 0 00.75-.75v-.568c0-.41-.34-.75-.75-.75h-.75a.75.75 0 01-.75-.75v-.568c0-.92.75-1.67 1.67-1.67h1.5a.75.75 0 00.6-.3l1.08-.902c.319-.48.226-1.121-.216-1.49l-1.068-.89a1.125 1.125 0 00-.405-.864v-.568a1.125 1.125 0 00-2.25 0z" />
     <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a8.25 8.25 0 100-16.5 8.25 8.25 0 000 16.5z" />
  </svg>
);
