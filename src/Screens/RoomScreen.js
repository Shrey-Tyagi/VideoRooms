import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, FlatList, TextInput, Image, TouchableOpacity, Linking, Platform, ToastAndroid } from 'react-native';
import Axios from 'axios';
import { baseUrl, user, flaskUrl } from '../Store/Keys';
import { fontCustomSize } from '../function';
import { storeData, getData } from '../Store/Storage';
import { captureScreen } from "react-native-view-shot";
import { Dialog } from 'react-native-simple-dialogs';
import ChatsStore from '../mobx/ChatsStore';

export default RoomScreen = (props) => {

    const [data, setData] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const [showDialog, setDialog] = useState(false);

    useEffect(() => {
        setLoading(true)
        Axios.post(baseUrl + "/api/room/getRoom").then(res => {
            setData(res.data)
            setLoading(false)
        })
    }, [])

    useEffect(() => {
        Linking.getInitialURL().then(url => {
            if (url != null) {
                Axios.post(baseUrl + "/api/room/findRoom", {
                    roomName: url.split("/")[url.split("/").length - 1]
                }).then(res => {
                    if (res.data == "" || res.data == null || res.data == []) {
                        ToastAndroid.show("Wrong Room Name", ToastAndroid.LONG)
                        return
                    }
                    ChatsStore.listItem = res.data[0];
                    ChatsStore.password = res.data[0].password
                    if (ChatsStore.password == "") {
                        getData(user).then(username => {
                            var tempUser = ChatsStore.listItem.users;
                            console.log(tempUser)
                            var userArray = []
                            tempUser.forEach(user => {
                                userArray = [
                                    ...userArray,
                                    user["name"]
                                ]
                            })
                            if (userArray.includes(username)) {
                                props.navigation.navigate("Stream", { data: ChatsStore.listItem })
                            } else {
                                tempUser = [
                                    ...tempUser,
                                    { name: username, role: "User" }
                                ]
                                Axios.post(baseUrl + "/api/room/addUser", {
                                    roomName: ChatsStore.listItem.roomName,
                                    users: tempUser
                                }).then(() => {
                                    props.navigation.navigate("Stream", { data: ChatsStore.listItem })
                                })
                            }
                        })
                    } else {
                        setDialog(true)
                    }
                })
            }
        });
    })

    ComponentMain = () => {
        const [password, setPassword] = useState('');
        return (
            <View>
                <TextInput
                    secureTextEntry={true}
                    placeholder={"******"}
                    style={{ borderBottomColor: "#454545", borderBottomWidth: 1 }}
                    value={password}
                    onChangeText={res => {
                        setPassword(res)
                    }}
                />
                <TouchableOpacity
                    onPress={() => {
                        if (ChatsStore.password == password) {
                            // getData(user).then(username => {
                            //     var tempUser = ChatsStore.listItem.users;
                            //     console.log(tempUser)
                            //     var userArray = []
                            //     tempUser.forEach(user => {
                            //         userArray = [
                            //             ...userArray,
                            //             user["name"]
                            //         ]
                            //     })
                            //     if (userArray.includes(username)) {
                            //         setDialog(false)
                            //         props.navigation.navigate("Description", { data: ChatsStore.listItem })
                            //     } else {
                            //         tempUser = [
                            //             ...tempUser,
                            //             { name: username, role: "User" }
                            //         ]
                            //         Axios.post(baseUrl + "/api/room/addUser", {
                            //             roomName: ChatsStore.listItem.roomName,
                            //             users: tempUser
                            //         }).then(() => {
                            //             setDialog(false)
                            //             props.navigation.navigate("Description", { data: ChatsStore.listItem })

                            //         })
                            //     }
                            // })

                            setDialog(false)
                            props.navigation.navigate("Description", { data: ChatsStore.listItem })

                        } else {
                            ToastAndroid.show("Wrong Password", ToastAndroid.LONG);
                        }
                    }}
                >
                    <Text>Join</Text>
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: "white" }}>
            {
                isLoading ? <View style={{ flex: 1 }}>
                    <ActivityIndicator size="large" />
                </View> : <View
                    style={{ flex: 1 }}
                >
                        <Dialog
                            visible={showDialog}
                            title="Password"
                        >
                            <ComponentMain />
                        </Dialog>
                        <FlatList
                            data={data}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    onPress={() => {

                                        if (item.password == "") {
                                            props.navigation.navigate("Description", { data: item })
                                        } else {
                                            ChatsStore.password = item.password
                                            ChatsStore.listItem = item;
                                            setDialog(true)
                                        }
                                    }}
                                    style={{ flexDirection: "row", margin: 10, padding: 10, borderRadius: 15, borderColor: "#d4d4d4", borderWidth: 1 }}>
                                    <View style={{ marginLeft: 10, justifyContent: "center", flex: 8 }}>
                                        <Text style={{ fontSize: fontCustomSize(14), fontWeight: "bold", color: "black" }}>{item.roomName}</Text>
                                        <Text style={{ fontSize: fontCustomSize(12), color: "#858585" }}>{item.users.length} viewer</Text>
                                    </View>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(item) => (item._id + "")}
                        />

                    </View>
            }


        </View>
    )
}