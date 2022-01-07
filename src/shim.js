function ShimMain() {

    // index.html
    ServerURL = "foobar";
	CommonIsMobile = CommonDetectMobile();
	TranslationLoad();
	DrawLoad();
	AssetLoadAll();
	// CommandsLoad();
	// CommonSetScreen("Character", "Login");
	ControllerActive = false;
	// ServerInit();
    CommonSetScreen("KinkyDungeon", "KinkyDungeonMain");
	MainRun(0);

    // LoginLoad
    Character = [];
	CharacterNextId = 1;
	CharacterReset(0, "Female3DCG");
	CharacterLoadCSVDialog(Player);
	// LoginCharacter = CharacterLoadNPC("NPC_Login");
	// LoginDoNextThankYou();
	// LoginStatusReset();
	// LoginErrorMessage = "";
	// if (LoginCredits == null) CommonReadCSV("LoginCredits", CurrentModule, CurrentScreen, "GameCredits");
	ActivityDictionaryLoad();
	// OnlneGameDictionaryLoad();
	// ElementCreateInput("InputName", "text", "", "20");
	// ElementCreateInput("InputPassword", "password", "", "20");
	// TextPrefetch("Room", "Mainhall");
	// LoginTextCacheUnsubscribeCallback = TextScreenCache.onRebuild(LoginUpdateMessage);


    CharacterAppearanceSetDefault(Player);    
    MiniGameStart("KinkyDungeon", 1, "ArcadeKinkyDungeonEnd");
}

// More misc. shims

KinkyDungeonMainRun = () => {};
KinkyDungeonMainClick = () => {};

TimerPrivateOwnerBeep = () => {};

ServerSend = () => {};
ServerAccountUpdate = {
    SyncToServer: () => {},
    QueueData: () => {}
};

ArcadeDeviousChallenge = true;
PrivateCharacter = [];

ChatRoomChatLog = [];
ChatRoomCharacterUpdate = () => {};

AsylumGGTSControlItem = () => false;

KinkyDungeonMultiplayerUpdate = () => {};