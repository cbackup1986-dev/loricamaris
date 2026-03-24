"use client"

import React from 'react';

interface SchemaOrgProps {
  data: Record<string, any>;
}

export function SchemaOrg({ data }: SchemaOrgProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
