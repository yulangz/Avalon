const socket = io.connect('http://localhost:3000');

// 当用户点击"加入房间"按钮时
document.getElementById('joinRoom').addEventListener('click', () => {
    const roomNumber = document.getElementById('roomNumberInput').value;
    const playerName = document.getElementById('playerNameInput').value;
    
    socket.emit('joinRoom', roomNumber, playerName);
});

socket.on('updatePlayers', (players) => {
    const playerListDiv = document.getElementById('playerList');
    playerListDiv.innerHTML = ''; // 清除现有玩家列表

    players.forEach(player => {
        const playerDiv = document.createElement('div');
        const playerCheckbox = document.createElement('input');
        playerCheckbox.type = 'checkbox';
        playerCheckbox.value = player;
        playerCheckbox.id = 'player-' + player;
        // playerCheckbox.disabled = !isCaptainTurn; // 如果不是队长的轮次则禁用复选框

        const playerLabel = document.createElement('label');
        playerLabel.htmlFor = 'player-' + player;
        playerLabel.textContent = player;

        playerDiv.appendChild(playerCheckbox);
        playerDiv.appendChild(playerLabel);
        playerListDiv.appendChild(playerDiv);
    });
});

// 当用户点击"离开房间"按钮时
document.getElementById('leaveRoom').addEventListener('click', () => {
    const roomNumber = document.getElementById('roomNumberInput').value;
    const playerName = document.getElementById('playerNameInput').value;

    socket.emit('leaveRoom', roomNumber, playerName);
});

socket.on('receiveRole', (roleName, canSeeDesc, canSeeRoles) => {
    // 创建一个新的div元素用于显示角色信息
    const roleInfoDiv = document.getElementById('roleInfo');

    // 添加身份信息
    const rolePara = document.createElement('p');
    rolePara.textContent = `你的身份是：${roleName}`;
    roleInfoDiv.appendChild(rolePara);

    // 如果有额外的身份信息，那么显示它
    if (canSeeDesc !== "") {
        const seeInfoPara = document.createElement('p');
        const rolesString = canSeeRoles.join(', '); // 把数组转换为逗号分隔的字符串
        seeInfoPara.textContent = `${canSeeDesc}: ${rolesString}`;
        roleInfoDiv.appendChild(seeInfoPara);
    }
});

socket.on('gameStarted', () => {
    // 进行其他游戏开始后的逻辑
});

// 当用户点击"开始游戏"按钮时
document.getElementById('startGame').addEventListener('click', () => {
    const roomNumber = document.getElementById('roomNumberInput').value; // 获取输入的房间名
    socket.emit('startGame', roomNumber);
});

// // 当轮到队长选择玩家组队时
// socket.on('captainTurn', () => {
//     isCaptainTurn = true; // 标记为队长的轮次
//     const checkboxes = playerListDiv.querySelectorAll('input[type="checkbox"]');
//     checkboxes.forEach(checkbox => {
//         checkbox.disabled = false; // 启用所有复选框
//     });
//     confirmTeamButton.style.display = 'block';  // 显示确认按钮
// });

document.getElementById('confirmTeam').addEventListener('click', () => {
    playerListDiv = document.getElementById('playerList');
    // console.log('confirmTeam');
    const selectedTeam = [];
    const checkboxes = playerListDiv.querySelectorAll('input[type="checkbox"]');

    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            selectedTeam.push(checkbox.value);
        }
    });

    if (selectedTeam.length) {
        socket.emit('teamSelected', selectedTeam);
        // isCaptainTurn = false; // 清除队长轮次标记
        // confirmTeamButton.style.display = 'none'; // 隐藏确认按钮
        // checkboxes.forEach(checkbox => {
        //     checkbox.disabled = true; // 禁用所有复选框
        // });
    } else {
        alert('你需要选择至少一个玩家！');
    }
});

// 监听 'error' 事件
socket.on('error', (errorMsg) => {
    alert(errorMsg); // 使用alert来显示错误信息
});

// 当收到队伍名单时
socket.on('teamAnnounced', (selectedTeam) => {
    // console.log('teamAnnounced');
    const teamAnnounceDiv = document.getElementById('teamAnnounced');
    teamAnnounceDiv.textContent = `队长选择了以下玩家组队: ${selectedTeam.join(', ')}`;

    const approveButton = document.getElementById('approveButton');
    const opposeButton = document.getElementById('opposeButton');

    approveButton.addEventListener('click', () => {
        socket.emit('openVote', 'approve');
        // 在投票后，你可以选择隐藏或禁用投票按钮
        approveButton.disabled = true;
        opposeButton.disabled = true;
    });

    opposeButton.addEventListener('click', () => {
        socket.emit('openVote', 'oppose');
        // 在投票后，你可以选择隐藏或禁用投票按钮
        approveButton.disabled = true;
        opposeButton.disabled = true;
    });
});

socket.on('voteResult', function(detailedResult) {
    // 获取显示结果的DOM元素
    const resultMessageElem = document.getElementById('resultMessage');
    const approveNamesElem = document.getElementById('approveNames');
    const opposeNamesElem = document.getElementById('opposeNames');

    // 更新显示的结果
    resultMessageElem.textContent = detailedResult.message;
    approveNamesElem.textContent = detailedResult.approveNames.join(', ');
    opposeNamesElem.textContent = detailedResult.opposeNames.join(', ');
});