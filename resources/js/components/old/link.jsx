import * as Headless from '@headlessui/react';
import { Link as RemixLink } from '@inertiajs/react';
import React, { forwardRef } from 'react';

export const Link = forwardRef(function Link(props, ref) {
  return (
    <Headless.DataInteractive>
      <RemixLink {...props} to={props.href} ref={ref} />
    </Headless.DataInteractive>
  );
});
