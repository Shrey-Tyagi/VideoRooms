import React, { useRef, useEffect, useState } from 'react';
import {
    View, Text, AppState, TouchableOpacity,
    FlatList, ScrollView, TextInput, Animated, Dimensions, Image, ToastAndroid
} from 'react-native';
import Video from 'react-native-video';
import YouTube from 'react-native-youtube';
import io from 'socket.io-client';
import { storeData, getData } from '../Store/Storage';
import { name, user, baseUrl, flaskUrl } from '../Store/Keys';
import AntIcon from 'react-native-vector-icons/AntDesign'
import MatIcon from 'react-native-vector-icons/MaterialCommunityIcons'
import Axios from 'axios';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import ChatsStore from '../mobx/ChatsStore'
import { Observer } from 'mobx-react';


var emoji1 = require('../../assests/image/heaty.png');


const FirstRoute = (props) => {
    // ADD QUEUE
    const [link, setLink] = React.useState("i96UO8-GFvw")
    return (
        <ScrollView style={{ backgroundColor: "#f4f4f4", flex: 1 }}>
            <Observer>
                {() => {
                    return (
                        <View>
                            <Observer>
                                {
                                    () => (
                                        ChatsStore.role == "Host" || ChatsStore.role == "SuperAdmin" ? <View style={{ padding: 10, backgroundColor: "#fff", alignItems: "center", borderBottomColor: "#8f8f8f", borderBottomWidth: 1, flex: 1, flexDirection: "row" }}>
                                            <TextInput
                                                onChangeText={res => {
                                                    setLink(res)
                                                }}
                                                value={link} placeholder={"Video Link"} style={{ flex: 1 }} />
                                            <TouchableOpacity
                                                style={{ borderRadius: 5, borderColor: "#252525", borderWidth: 1, }}
                                                onPress={() => {
                                                    if (link != "") {
                                                        Axios.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + link + "&key=AIzaSyCm7cvQdOwCnslbRqECA015md9Pj_n4ZnM").then(yData => {
                                                            var snippet = yData.data.items[0].snippet
                                                            var temp = ChatsStore.queueData
                                                            console.log(temp.length)
                                                            temp = [
                                                                ...temp,
                                                                {
                                                                    videoUrl: link,
                                                                    title: snippet.title,
                                                                    image: snippet.thumbnails.default.url,
                                                                    channelId: snippet.channelTitle
                                                                }
                                                            ]
                                                            console.log(temp.length)

                                                            Axios.post(baseUrl + "/api/room/addVideo", {
                                                                roomName: ChatsStore.videoData.roomName,
                                                                videoQueue: temp
                                                            }).then(res => {
                                                                console.log("done")
                                                            })

                                                        })


                                                    }
                                                }}
                                            ><Text style={{ textAlign: "center" }}>Add Video</Text></TouchableOpacity>
                                        </View> : null
                                    )
                                }
                            </Observer>
                            <FlatList
                                data={ChatsStore.queueData}
                                renderItem={({ item }) => (<View style={{ padding: 10 }}>
                                    <Text>{item.title}</Text>
                                </View>)}
                                keyExtractor={(item) => (item + "")}
                            />
                        </View>
                    )
                }}
            </Observer>

        </ScrollView >
    )
};

const SecondRoute = (props) => {
    // CHAT SCREEN
    const [text, setText] = useState("")
    const [username, setUsername] = useState("");

    useEffect(() => {
        ChatsStore.messageData = []

        getData(user).then(username => {
            setUsername(username)
        })
        Axios.post(baseUrl + "/api/room/getMessage", {
            roomName: ChatsStore.videoData.roomName
        }).then(res => {
            ChatsStore.messageData = res.data
        })
    }, [])

    return (
        <View>
            <View style={{ flexDirection: "row", backgroundColor: "white", alignItems: 'center', paddingLeft: 10, paddingRight: 10, flexDirection: "row", borderBottomColor: "#151515", borderBottomWidth: 1 }}>
                <TextInput
                    value={text}
                    onChangeText={res => {
                        setText(res)
                    }}
                    placeholder={'Message'}
                    style={{ flex: 1 }} />
                <MatIcon
                    onPress={() => {
                        Axios.get(flaskUrl + "/translate/" + text.replace(" ", "%20") + "/2").then(res => {
                            getData(user).then(username => {
                                var temp = [];
                                temp = [
                                    ...ChatsStore.messageData,
                                    {
                                        text: res.data,
                                        username: username,
                                        time: new Date().getTime()
                                    }
                                ]
                                props.route.socket.emit("addMessage", {
                                    roomName: ChatsStore.videoData.roomName,
                                    message: temp
                                })
                                setText("")
                            })
                        })

                    }}
                    name="google-translate" size={20} />

                <AntIcon
                    onPress={() => {
                        getData(user).then(username => {
                            var temp = [];
                            temp = [
                                ...ChatsStore.messageData,
                                {
                                    text: text,
                                    username: username,
                                    time: new Date().getTime()
                                }
                            ]
                            props.route.socket.emit("addMessage", {
                                roomName: ChatsStore.videoData.roomName,
                                message: temp
                            })
                            setText("")
                        })
                    }}
                    name="upload" size={20} />
            </View>
            <ScrollView>
                <Observer>
                    {
                        () => (
                            <FlatList
                                inverted={true}
                                data={ChatsStore.messageData}
                                renderItem={({ item }) => (item.username == username ?
                                    <View style={{ flex: 1, backgroundColor: "white", borderRadius: 5, margin: 10, marginBottom: 5, padding: 10 }} >
                                        <Text style={{ flex: 1, textAlign: "right", fontWeight: "bold" }}>{item.username}</Text>
                                        <Text style={{ flex: 1, textAlign: "right" }}>{item.text}</Text>
                                    </View>
                                    : <View style={{ flex: 1, backgroundColor: "white", borderRadius: 5, margin: 10, marginBottom: 5, padding: 10 }} >
                                        <Text style={{ flex: 1, textAlign: "left", fontWeight: "bold" }}>{item.username}</Text>
                                        <Text style={{ flex: 1, textAlign: "left" }}>{item.text}</Text>
                                    </View>)}
                                keyExtractor={(item) => (item)}
                            />
                        )
                    }
                </Observer>

            </ScrollView>


        </View>
    )
};


const ThirdRoute = (props) => {
    // EMOJI
    return (
        <ScrollView>
            <FlatList
                data={ChatsStore.emojiData}
                numColumns={2}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => {
                            props.route.socket.emit("createEmoji", {
                                emojiId: item.id,
                                roomName: ChatsStore.videoData.roomName
                            })
                        }}
                    >
                        <Image source={item.image} style={{ resizeMode: "contain", height: Dimensions.get("window").width / 2, width: Dimensions.get("window").width / 2 }} />
                    </TouchableOpacity>
                )}
                keyExtractor={(item) => (item.id)}
            />

        </ScrollView>
    )
};

const ViewerRoute = (props) => {
    //View
    props.route.socket.on("updateViewer", res => {
        ChatsStore.users = res
    })
    useEffect(() => {
        console.log(ChatsStore.users)
    })

    return (
        <ScrollView>
            <TouchableOpacity
                onPress={() => {
                    Axios.post(baseUrl + "/api/room/refreshUser",
                        {
                            roomName: ChatsStore.videoData.roomName,
                        }
                    )
                }}
            >
                <View style={{ flex: 1, flexDirection: "row", margin: 10, alignItems: 'center', backgroundColor: "white", borderRadius: 5, padding: 10, marginBottom: 5 }}>
                    <Text style={{ flex: 6 }}>Refresh</Text>
                </View>
            </TouchableOpacity>
            <Observer>
                {() => (
                    <FlatList
                        data={ChatsStore.users}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                onPress={() => {
                                    if (ChatsStore.role == "SuperAdmin" || ChatsStore.role == "Host") {
                                        if (item.role != "User") return
                                        var temp = []
                                        ChatsStore.users.forEach(data => {
                                            if (data.name == item.name) {
                                                temp = [
                                                    ...temp,
                                                    {
                                                        name: data.name,
                                                        role: "Host"
                                                    }
                                                ]
                                            } else {
                                                temp = [
                                                    ...temp,
                                                    {
                                                        name: data.name,
                                                        role: data.role
                                                    }
                                                ]
                                            }
                                        })
                                        Axios.post(baseUrl + "/api/room/addUser",
                                            {
                                                roomName: ChatsStore.videoData.roomName,
                                                users: temp
                                            }
                                        )
                                    }
                                }}
                            >
                                <View style={{ flex: 1, flexDirection: "row", margin: 10, alignItems: 'center', backgroundColor: "white", borderRadius: 5, padding: 10, marginBottom: 5 }}>
                                    <Text style={{ flex: 6 }}>{item.name}</Text>
                                    <Text>{item.role}</Text>
                                </View>
                            </TouchableOpacity>

                        )}
                        keyExtractor={(item) => (item)}
                    />
                )}
            </Observer>
        </ScrollView >
    )
}

const ExtraRoute = (props) => (<Text>Working</Text>)

const initialLayout = { width: Dimensions.get('window').width };


export default Stream = (props) => {
    const refVideo = useRef(null);
    const [isPlaying, setPlaying] = useState(true);
    const [role, setRole] = useState(null)
    const [dime, setDime] = useState({
        height: 300,
        width: 400
    });
    this.videoStatus = "stopped";
    const bottomValue = useRef(new Animated.Value(0)).current;
    const [currentLink, setLink] = useState("");

    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'first', title: 'Playlist' },
        { key: 'second', title: 'Chat', socket: io(baseUrl) },
        { key: 'fourth', title: "Viewer", socket: io(baseUrl) },
        { key: 'fifth', title: "Extras", socket: io(baseUrl) },
        { key: 'third', title: "Stickers", socket: io(baseUrl) },
    ]);
    const [isLoaded, setLoaded] = useState(false)

    const renderScene = SceneMap({
        first: FirstRoute,
        second: SecondRoute,
        third: ThirdRoute,
        fourth: ViewerRoute,
        fifth: ExtraRoute
    });

    // Remove user 
    removeUserFunc = () => {
        getData(user).then(res => {
            var temp = []
            props.route.params.data.users.forEach(user => {
                if (user["name"] != res) {
                    temp = [
                        ...temp,
                        user
                    ]
                }
            })
            this.socket.emit("removeUser", { videoUrl: props.route.params.data["videoUrl"], newUser: temp })
        })
    }

    useEffect(() => {
        ChatsStore.videoData = props.route.params.data
        ChatsStore.queueData = props.route.params.data.videoQueue
        ChatsStore.users = props.route.params.data.users

        if (props.route.params.data.videoQueue.length > 0) {
            setLink(props.route.params.data.videoQueue[0]["link"])
        }
        this.socket = io(baseUrl);
        this.isFullScreen = false;
        getData(user).then(username => {
            this.socket.on("connect", () => {
                this.socket.emit("updateUser", {
                    name: username,
                    id: this.socket.id
                })
            })
            var roleTemp = null;
            props.route.params.data["users"].forEach((res, index) => {
                if (res["name"] == username) {
                    roleTemp = props.route.params.data["users"][index]["role"];
                    ChatsStore.role = roleTemp
                    setRole(roleTemp);
                    setLoaded(true)
                }
            })

            setInterval(() => {
                if (ChatsStore.role == "Host" || ChatsStore.role == "SuperAdmin") {
                    if (refVideo.current != null) {
                        // Update Second
                        refVideo.current.getCurrentTime().then(res => {
                            this.currentTime = res;
                            tempVid = {
                                username: username,
                                currentTime: res,
                                status: this.videoStatus,
                                roomName: props.route.params.data.roomName
                            };
                            this.socket.emit("setVideoData", tempVid)
                        })
                        // Update Queue
                        refVideo.current.getCurrentTime().then(time => {
                            refVideo.current.getDuration().then(dur => {
                                if (parseInt(time) == parseInt(dur)) {
                                    if (ChatsStore.queueData.length > 1) {
                                        var temp = []
                                        ChatsStore.queueData.forEach((item, index) => {
                                            if (index > 0) {
                                                temp = [
                                                    ...temp,
                                                    item
                                                ]
                                            }
                                        })
                                        var dataTemp = {
                                            roomName: ChatsStore.videoData.roomName,
                                            queueData: temp
                                        }
                                        this.socket.emit("setQueueData", dataTemp)
                                    }
                                }
                            })
                        })
                    }
                }
            }, 500)

            this.socket.on("updateVideo", res => {
                refVideo.current.getCurrentTime().then(videoTime => {
                    if (res.status == "playing") {
                        if (!((videoTime > res.currentTime - 2) && (videoTime < res.currentTime + 2))) {
                            var tem = parseInt(res.currentTime) + 1;
                            console.log("update " + tem)
                            refVideo.current.seekTo(tem)
                        }
                        setPlaying(true)
                    } else {
                        setPlaying(false)
                    }

                })
            })

            this.socket.on("changeQueue", res => {
                console.log(res)
                ChatsStore.queueData = res.queueData
                setPlaying(true)
                refVideo.current.seekTo(0)
                ToastAndroid.show("Next Video", ToastAndroid.LONG);
            })

            this.socket.on("updateQueue", res => {
                console.log(res)
                ChatsStore.queueData = res.videoQueue
            })

            this.socket.on("updateEmoji", res => {
                console.log(res)
                ChatsStore.emojiId = res;
                ChatsStore.showEmoji = true
                runAnimation();
            })

            this.socket.on("closeVideo", res => {
                props.navigation.pop();
            })

            this.socket.on("updateMessage", res => {
                console.log(res)
                ChatsStore.messageData = res
            })

            this.socket.on("updateUser", res => {

                ChatsStore.users = res.users
                getData(user).then(username => {
                    var roleTemp = null;
                    ChatsStore.users.forEach((res, index) => {
                        if (res["name"] == username) {
                            roleTemp = ChatsStore.users[index]["role"];
                            ChatsStore.role = roleTemp
                            setRole(roleTemp);
                            setLoaded(true)
                        }
                    })
                })
                console.log(res)
            })


        })
    }, [])

    runAnimation = () => {
        bottomValue.setValue(0);
        Animated.timing(
            bottomValue,
            {
                toValue: dime.height + 50,
                duration: 4000
            }
        ).start()
    }

    return (
        <View style={{ flex: 1 }}>
            <View
                onLayout={r => setDime(r.nativeEvent.layout)}
            >
                <Observer>
                    {() => {
                        ChatsStore.emojiId// Change every time
                        var img = null
                        ChatsStore.emojiData.forEach(res => {
                            if (res.id == ChatsStore.emojiId) {
                                img = res.image;
                            }
                        })
                        return (ChatsStore.showEmoji ? (<View style={{ position: "absolute", top: 0, height: Math.round(dime.height), right: 20, width: Math.round(dime.width) / 3, zIndex: 2 }}>
                            <Animated.Image
                                source={img}
                                resizeMode={"contain"}
                                style={{ position: "absolute", bottom: bottomValue, height: (Math.round(dime.height) / 3) - 20, width: (Math.round(dime.width) / 3) - 20 }}
                            />
                        </View>) : null)
                    }
                    }
                </Observer>
                <Observer>
                    {
                        () => (
                            ChatsStore.queueData.length > 0 ?
                                <YouTube
                                    ref={refVideo}
                                    apiKey="AIzaSyCm7cvQdOwCnslbRqECA015md9Pj_n4ZnM"
                                    videoId={ChatsStore.queueData[0]["videoUrl"]}
                                    style={{ alignSelf: 'stretch', height: 300 }}
                                    showinfo={true}
                                    onReady={res => {
                                        refVideo.current.seekTo(props.route.params.data.currentPosition)
                                        this.currentTime = props.route.params.data.currentPosition
                                        if (props.route.params.data.status == "playing") {
                                            setPlaying(true)
                                        } else {
                                            setPlaying(false)
                                        }
                                    }}
                                    controls={ChatsStore.role == "SuperAdmin" ? 1 : 0}
                                    modestbranding={true}
                                    play={isPlaying}
                                    onChangeState={e => {
                                        this.videoStatus = e["state"]
                                    }}
                                    onChangeFullscreen={e => {
                                        this.isFullScreen = e.isFullscreen
                                    }}
                                    onError={e => console.log(e)}
                                />
                                // <View style={{ height: dime.height, width: dime.width, backgroundColor: "#656655" }} />
                                :
                                <View style={{ height: dime.height, width: dime.width, backgroundColor: "#656655" }} />
                        )
                    }
                </Observer>
            </View>
            <TabView
                keyboardDismissMode="on-drag"
                renderTabBar={props => (
                    <TabBar
                        tabStyle={{ width: Dimensions.get("window").width / 4 }}
                        scrollEnabled={true}
                        {...props}
                        labelStyle={{ color: "black" }}
                        indicatorStyle={{ backgroundColor: 'black' }}
                        style={{ backgroundColor: 'white' }}
                    />
                )}
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={initialLayout}
            />
        </View >
    );
}