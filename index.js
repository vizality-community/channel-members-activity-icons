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
      GITHUB: `vizality://plugins/${this.addonId}/assets/github.png`,
      NETFLIX: `vizality://plugins/${this.addonId}/assets/netflix.png`,
      SPOTIFY: `vizality://plugins/${this.addonId}/assets/spotify.png`,
      TWITCH: `vizality://plugins/${this.addonId}/assets/twitch.png`,
      "YOUTUBE MUSIC": `vizality://plugins/${this.addonId}/assets/youtubemusic.png`,
    };

    this.Special = [
      "github",
      "netflix",
      "youtube music",
    ]
  }

  stop () {
    unpatch('channel-members-activity-icons');
  }

  injectActivityIcons () {
    const MemberListItem = getModuleByDisplayName('MemberListItem');
    const { getGame } = getModule('getGame');

    patch('channel-members-activity-icons', MemberListItem.prototype, 'render', (_, res) => {
      if (!res.props?.subText?.props) return res;

      const activities = res?.props?.subText?.props?.activities;
      if (!activities?.length) return res;

      res.props.children = [];

      for (const activity of activities) {
        if (activity.application_id && activity.assets && (activity.assets?.large_image || activity.assets?.small_image)) {
          if (this.Special.includes(activity.name.toLowerCase())) {
            let src
            if (activity.assets?.large_image.split("mp:external/").join("").split(".")[1] || activity.assets?.small_image.split("mp:external/").join("").split(".")[1]) src = `https://media.discordapp.net/external/${activity.assets?.large_image.split("mp:external/").join("") || activity.assets?.small_image.split("mp:external/").join("")}`
            else src = this.Images[activity.name.toUpperCase()];
            
            res.props.children.push(
            <ActivityIcon text={activity.name}
              src={src}
            />
          );
          }
          else res.props.children.push(
            <ActivityIcon text={activity.name}
              src={`https://cdn.discordapp.com/app-assets/${activity.application_id}/${activity.assets?.large_image || activity.assets?.small_image}`}
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
