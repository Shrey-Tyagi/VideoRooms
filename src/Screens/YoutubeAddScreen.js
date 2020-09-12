import React, { useState } from 'react';
import { View, Text, ActivityIndicator, Image } from 'react-native';
import Axios from 'axios';
import { TextInput, TouchableOpacity } from 'react-native-gesture-handler';
import { storeData, getData } from '../Store/Storage';
import { user, baseUrl } from '../Store/Keys';

export default YoutubeAddScreen = ({ navigation }) => {

    const [isLoading, setLoading] = useState(false);
    const [link, setLink] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState("");

    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>

            <View style={{ flex: 1, flexDirection: "column" }}>
                <View style={{ flex: 1, flexDirection: "row" }}>
                    <Image source={require("../../assests/image/heaty.png")} style={{ height: 100, width: 100, borderRadius: 10 }} />
                </View>
            </View>

            <TextInput
                onChangeText={res => {
                    setName(res)
                }}
                value={name}
                placeholder={"Room Name"}
                style={{ borderBottomColor: "black", borderBottomWidth: 1, backgroundColor: "#f4f4f4" }} />
            <TextInput
                onChangeText={res => {
                    setLink(res)
                }}
                value={link}
                placeholder={"Zi3VGpnvwWs"}
                style={{ borderBottomColor: "black", borderBottomWidth: 1, backgroundColor: "#f4f4f4" }} />

            <TextInput
                onChangeText={res => {
                    setPassword(res)
                }}
                value={password}
                placeholder={"Secure your room"}
                style={{ borderBottomColor: "black", marginTop: 10, borderBottomWidth: 1, backgroundColor: "#f4f4f4" }} />


            <TouchableOpacity
                onPress={() => {
                    setLoading(true)
                    if (name != "") {
                        if (link != "") {
                            var id = link
                            Axios.get("https://www.googleapis.com/youtube/v3/videos?part=snippet&id=" + id + "&key=AIzaSyCm7cvQdOwCnslbRqECA015md9Pj_n4ZnM").then(yData => {
                                getData(user).then(username => {
                                    var snippet = yData.data.items[0].snippet
                                    var getData = {
                                        roomName: name,
                                        currentPosition: 0,
                                        status: "Loading",
                                        password: password,
                                        videoQueue: [{
                                            videoUrl: id,
                                            title: snippet.title,
                                            image: snippet.thumbnails.default.url,
                                            channelId: snippet.channelTitle
                                        }],
                                        users: [{
                                            name: username,
                                            role: "SuperAdmin"
                                        }],
                                        createdOn: new Date()
                                    }
                                    Axios.post(baseUrl + "/api/room/createRoom", getData).then(res => {
                                        setLoading(false)
                                    }).then(() => {
                                        navigation.pop();
                                        navigation.navigate("Stream", { data: getData })
                                    })
                                })
                            })
                        } else {
                            getData(user).then(username => {
                                var getData = {
                                    roomName: name,
                                    currentPosition: 0,
                                    status: "Loading",
                                    password: password,
                                    videoQueue: [],
                                    users: [{
                                        name: username,
                                        role: "SuperAdmin"
                                    }],
                                    createdOn: new Date()
                                }
                                Axios.post(baseUrl + "/api/room/createRoom", getData).then(res => {
                                    setLoading(false)
                                }).then(() => {
                                    navigation.navigate("Stream", { data: getData })
                                })
                            })
                        }
                    }
                }}
                style={{ backgroundColor: "#5454df", margin: 10, elevation: 3, justifyContent: "center", alignItems: 'center', paddingTop: 10, paddingBottom: 10 }}
            >
                <Text style={{ color: "white", fontSize: 20 }}>
                    Create Room
                </Text>
            </TouchableOpacity>
            {isLoading ? <View style={{ flex: 1, justifyContent: "center", alignItems: 'center' }}>
                <ActivityIndicator style={{ position: "absolute" }} size="large" />
            </View> : null}
        </View>
    );
}