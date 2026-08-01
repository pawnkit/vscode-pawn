#include <open.mp>

#if defined FEATURE_ENABLED
    #define ACTIVE_COLOUR 0x33CCFFFF
#else
    #endinput
#endif

enum PlayerState
{
    PLAYER_STATE_IDLE,
    PLAYER_STATE_READY
};

hook OnGameModeInit()
{
    foreach (new playerid : Player)
    {
        SendClientMessage(playerid, ACTIVE_COLOUR, "Ready");
    }
    return 1;
}
