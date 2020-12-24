import React, { memo } from 'react';

import { Tooltip, LazyImage } from '@vizality/components';

export default memo(({ text, src }) => {
  return (
    <Tooltip
      text={text}
      position='left'
      className='channel-members-activity-icons-image'
    >
      <LazyImage
        className='channel-members-activity-icons-image-wrapper'
        imageClassName='channel-members-activity-icons-img'
        src={src}
      />
    </Tooltip>
  );
});
