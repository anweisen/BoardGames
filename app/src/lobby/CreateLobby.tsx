export default ({connectSocket}: { connectSocket: (url: string) => void }) => {
  return (
    <div className={"CreateLobby"}>
      <div onClick={event => {
        connectSocket("ws://localhost:5000/gateway/create");
      }}>
        CREATE
      </div>
    </div>
  );
}