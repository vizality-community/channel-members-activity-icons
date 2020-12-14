const { getModule, getModuleByDisplayName } = require('@vizality/webpack');
const { patch, unpatch } = require('@vizality/patcher');
const { joinClassNames } = require('@vizality/util');
const { Tooltip } = require('@vizality/components');
const { Plugin } = require('@vizality/entities');
const { React } = require('@vizality/react');

module.exports = class ChannelMembersActivityIcons extends Plugin {
  onStart () {
    this.injectStyles('styles/main.scss');
    this.injectActivityIcons();

    this.Images = {
      SPOTIFY: `vz-plugin://${this.addonId}/assets/spotify.png`,
      TWITCH: `vz-plugin://${this.addonId}/assets/twitch.png`
    };
  }

  onStop () {
    unpatch('cmai-activity-icons');
  }

  async injectActivityIcons () {
    const MemberListItem = getModuleByDisplayName('MemberListItem');
    const { getGame } = getModule('getGame');

    patch('cmai-activity-icons', MemberListItem.prototype, 'render', (_, res) => {
      if (!res.props?.subText?.props) return res;

      const { activities } = res.props.subText.props;

      res.props.children = [];

      for (const activity of activities) {
        if ((activity.application_id && activity.assets && (activity.assets?.large_image || activity.assets?.small_image)) ||
            (activity.type === 2 && activity.name === 'Spotify') || activity.type === 1) {
          res.props.children.push(
            <Tooltip text={activity.name} position='left' className='cmai-activity-icon-wrapper'>
              <div
                className='cmai-activity-icon'
                style={{
                  backgroundImage: `url(${activity.name === 'Spotify'
                    ? this.Images.SPOTIFY
                    : activity.type === 1
                      ? this.Images.TWITCH
                      : `https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets?.large_image || activity.assets?.small_image}.png`
                  })`
                }}
              />
            </Tooltip>
          );
        }

        if (activity.application_id && activity.type === 0 && !activity.assets) {
          const appId = activity.application_id;
          const icon = getGame(appId)?.icon;
          if (icon) {
            res.props.children.push(
              <Tooltip text={activity.name} position='left' className='cmai-activity-icon-wrapper'>
                <div
                  className='cmai-activity-icon'
                  style={{
                    backgroundImage: `url('https://cdn.discordapp.com/app-icons/${appId}/${icon}.png')`
                  }}
                />
              </Tooltip>
            );

            res.props.className = joinClassNames(res.props.className, 'vz-hasActivityIcon');
          }
        }
      }

      return res;
    });
  }
};
