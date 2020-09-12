import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Share, TextInput, Image, TouchableOpacity, Linking, Platform, ToastAndroid } from 'react-native';
import Axios from 'axios';
import { baseUrl, user, flaskUrl } from '../Store/Keys';
import { fontCustomSize } from '../function';
import { storeData, getData } from '../Store/Storage';
import { captureScreen } from "react-native-view-shot";
import { Dialog } from 'react-native-simple-dialogs';
import ChatsStore from '../mobx/ChatsStore';

export default RoomDescription = (props) => {

    const [data, setData] = useState({})
    const [admin, setAdmin] = useState("")

    useEffect(() => {
        setData(props.route.params.data)
        props.route.params.data.users.forEach(usr => {
            if (usr.role == "SuperAdmin") {
                setAdmin(usr.name)
                return
            }
        })
        console.log(props.route.params.data)
    })

    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>
            <View style={{ backgroundColor: "#d4d4d4", flexDirection: "row", alignItems: "center", padding: 10 }}>
                <Image source={require("../../assests/image/concert.jpeg")} style={{ backgroundColor: "white", height: 80, width: 80, borderRadius: 100 }} />
                <View style={{ marginLeft: 10 }}>
                    <Text style={{ fontSize: 20 }}>{data.roomName}</Text>
                    <Text style={{ fontSize: 12 }}>{data.status}</Text>
                </View>
            </View>
            <View style={{ padding: 16 }}>


                <Text style={{ fontSize: 10, fontWeight: "800" }}>Currently Playing</Text>
                <View style={{ flexDirection: 'row', alignItems: "center", marginTop: 10 }}>
                    <Image source={{ uri: props.route.params.data.videoQueue[0]["image"] }} style={{ height: 40, width: 40, borderRadius: 40 }} />
                    <Text style={{ fontSize: 16, marginLeft: 20 }}>{props.route.params.data.videoQueue[0]["title"]}</Text>
                </View>

                <Text style={{ fontSize: 10, fontWeight: "800", marginTop: 20 }}>Description</Text>
                <Text style={{ fontSize: 16 }}>Lorem ipsum dolor sit amet, consectetur adipiscing
                elit. Quisque consequat risus id mi sagittis, ac lacinia elit placerat. Etiam viverra, ex blandit scelerisque aliquam, arcu mi ornare ipsum, et bibendum dolor turpis vel magna. Donec sed suscipit ligula, ut vehicula nisi. Pellentesque condimentum tellus neque, ac cursus dui auctor vel. Curabitur porttitor faucibus finibus. Integer ullam
                 .</Text>

                <Text style={{ fontSize: 10, fontWeight: "800", marginTop: 20 }}>Admin</Text>
                <Text style={{ fontSize: 16 }}>{admin}</Text>

                <TouchableOpacity
                    style={{ margin: 10, marginTop: 20, backgroundColor: "#4545ff", alignItems: 'center', justifyContent: "center", padding: 10, borderRadius: 10 }}
                    onPress={() => {
                        getData(user).then(username => {
                            var tempUser = data.users;
                            var userArray = []
                            tempUser.forEach(user => {
                                userArray = [
                                    ...userArray,
                                    user["name"]
                                ]
                            })
                            if (userArray.includes(username)) {
                                props.navigation.navigate("Stream", { data: data })
                            } else {
                                tempUser = [
                                    ...tempUser,
                                    { name: username, role: "User" }
                                ]
                                Axios.post(baseUrl + "/api/room/addUser", {
                                    roomName: item.roomName,
                                    users: tempUser
                                }).then(() => {
                                    props.navigation.navigate("Stream", { data: data })
                                })
                            }
                        })
                    }}
                >
                    <Text style={{ fontWeight: "bold", fontSize: 20, color: "white" }}>Watch Now</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={{ margin: 10, backgroundColor: "#4545ff", alignItems: 'center', justifyContent: "center", padding: 10, borderRadius: 10 }}
                    onPress={() => {
                        Share.share({
                            message: 'http://192.168.43.249/healthrx.html?room=' + data.roomName,
                            url: 'http://192.168.43.249/healthrx.html?room=' + data.roomName,
                            title: 'Share room'
                        }, {
                            // Android only:
                            dialogTitle: 'Share BAM goodness',
                            // iOS only:
                            excludedActivityTypes: [
                                'com.apple.UIKit.activity.PostToTwitter'
                            ]
                        })
                    }}
                >
                    <Text style={{ color: "white", fontSize: 20 }}>Share</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}