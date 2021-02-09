import React from 'react';

import { getModule, getModuleByDisplayName } from '@vizality/webpack';
import { patch, unpatch } from '@vizality/patcher';
import { Plugin } from '@vizality/entities';

import ActivityIcon from './components/ActivityIcon';

export default class ChannelMembersActivityIcons extends Plugin {
  start () {
    this.injectStyles('styles/main.scss');
    this.injectActivityIcons();

    this.Images = {
      SPOTIFY: `vz-plugin://${this.addonId}/assets/spotify.png`,
      TWITCH: `vz-plugin://${this.addonId}/assets/twitch.png`
    };
  }

  stop () {
    unpatch('channel-members-activity-icons');
  }

  async injectActivityIcons () {
    const MemberListItem = getModuleByDisplayName('MemberListItem');
    const { getGame } = getModule('getGame');

    patch('channel-members-activity-icons', MemberListItem.prototype, 'render', (_, res) => {
      if (!res.props?.subText?.props) return res;

      const activities = res?.props?.subText?.props?.activities;
      if (!activities?.length) return res;

      res.props.children = [];

      for (const activity of activities) {
        if (activity.application_id && activity.assets && (activity.assets?.large_image || activity.assets?.small_image)) {
          res.props.children.push(
            <ActivityIcon text={activity.name}
              src={`https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets?.large_image || activity.assets?.small_image}.png`}
            />
          );
        }

        if (activity.type === 2 && activity.name === 'Spotify') {
          res.props.children.push(
            <ActivityIcon text={activity.name} src={this.Images.SPOTIFY} />
          );
        }

        if (activity.type === 1) {
          res.props.children.push(
            <ActivityIcon text={activity.name} src={this.Images.TWITCH} />
          );
        }

        if (activity.application_id && activity.type === 0 && !activity.assets) {
          const appId = activity.application_id;
          const icon = getGame(appId)?.icon;

          icon && res.props.children.push(
            <ActivityIcon text={activity.name} src={`https://cdn.discordapp.com/app-icons/${appId}/${icon}.png`} />
          );

          // res.props['vz-icon'] = '';
        }
      }

      return res;
    });
  }
}
