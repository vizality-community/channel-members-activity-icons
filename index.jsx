const { getModuleByDisplayName } = require('@webpack');
const { patch, unpatch } = require('@patcher');
const { joinClassNames } = require('@util');
const { Tooltip } = require('@components');
const { Plugin } = require('@entities');
const { React } = require('@react');

const SpotifyLogo = '/assets/f0655521c19c08c4ea4e508044ec7d8c.png';
const TwitchLogo = '/assets/edbbf6107b2cd4334d582b26e1ac786d.png';

module.exports = class ChannelMembersActivityIcons extends Plugin {
  onStart () {
    this.injectStyles('styles/main.scss');
    this.injectActivityIcons();
  }

  onStop () {
    unpatch('channel-members-activity-icons');
  }

  async injectActivityIcons () {
    const MemberListItem = getModuleByDisplayName('MemberListItem');

    patch('channel-members-activity-icons', MemberListItem.prototype, 'render', (_, res) => {
      if (!res.props || !res.props.subText || !res.props.subText.props) return res;

      const { activities } = res.props.subText.props;

      for (const activity of activities) {
        if ((activity.application_id && activity.assets && activity.assets.small_image) ||
        (activity.type && activity.type === 2 && activity.name === 'Spotify') ||
        (activity.type && activity.type === 1)) {
          res.props.children =
            <Tooltip text={activity.name} position='left'>
              <div
                className='channel-members-activity-icon'
                style={{
                  backgroundImage: `url(${activity.name === 'Spotify'
                    ? SpotifyLogo
                    : activity.type === 1
                      ? TwitchLogo
                      : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets.small_image}.png`
                  })`
                }}
              />
            </Tooltip>;

          res.props.className = joinClassNames(res.props.className, 'vz-hasActivityIcon');

          return res;
        }
      }

      return res;
    });
  }
};
