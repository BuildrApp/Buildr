# Socket Library

This library includes the following utilities for using sockets:

 - `SocketConnection`: This class allows communication from a socket server to its client
 - `SocketMessage`: This class represents messages send over socket
 - `Stringifyable`: This type alias represents types that can be send via socket
 - `MessageTranslator`: This module exports methods to convert between a `SocketMessage` and a socket message.