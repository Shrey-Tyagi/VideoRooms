import { observable, decorate } from 'mobx'

var emoji1 = require('../../assests/image/heaty.png');

class NotificationStore {
    @observable videoData = {};
    @observable queueData = [];

    @observable users = [];
    @observable role = "";

    @observable emojiData = [
        {
            image: emoji1,
            id: "1"
        },
        {
            image: emoji1,
            id: "2"
        },
        {
            image: emoji1,
            id: "3"
        },
        {
            image: emoji1,
            id: "4"
        },
        {
            image: emoji1,
            id: "5"
        },
        {
            image: emoji1,
            id: "6"
        },
    ];
    @observable showEmoji = false;
    @observable emojiId = 1;

    @observable messageData = [];

    @observable password = "";
    @observable listItem = null;
}


export default new NotificationStore;
