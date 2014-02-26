<?php

/**
 * BMGameAction: record of an action which happened during a game
 *
 * @author chaos
 *
 * @property     int    $gameState           BMGameState of the game when the action occurred
 * @property     string $actionType          Type of action which was taken
 * @property     int    $actingPlayerId      Database ID of player who took the action
 * @property     array  $params              Array of information about the action, format depends on actionType
 */

class BMGameAction {

    private $gameState;
    private $actionType;
    private $actingPlayerId;
    private $params;

    public function __construct(
        $gameState,
        $actionType,
        $actingPlayerId,
        $params
    ) {
        $this->gameState = $gameState;
        $this->actionType = $actionType;
        $this->actingPlayerId = $actingPlayerId;
        $this->params = $params;
    }

    public function friendly_message($playerIdNames, $roundNumber, $gameState) {
        $this->outputPlayerIdNames = $playerIdNames;
        $this->outputRoundNumber = $roundNumber;
        $this->outputGameState = $gameState;
        if (is_array($this->params)) {
            $funcName = 'friendly_message_' . $this->actionType;
            if (method_exists($this, $funcName)) {
                $result = $this->$funcName();
            } else {
                $result = "";
            }
            return $result;

        } else {
            // Messages should now be arrays, but some old string
            // messages might still be in the DB.  Use the old logic for these
            if ($this->actionType == 'attack') {
                return $playerIdNames[$this->actingPlayerId] . ' ' . $this->params;
            }
            if ($this->actionType == 'end_winner') {
                return ('End of round: ' . $playerIdNames[$this->actingPlayerId] . ' ' . $this->params);
            }
            return($this->params);
        }
    }

    protected function friendly_message_end_draw() {
        $message = 'Round ' . $this->params['roundNumber'] .
                   ' ended in a draw (' .
                   $this->params['roundScoreArray'][0] . ' vs. ' .
                   $this->params['roundScoreArray'][1] . ')';
        return $message;
    }

    protected function friendly_message_end_winner() {
        $message = 'End of round: ' . $this->outputPlayerIdNames[$this->actingPlayerId] .
                   ' won round ' . $this->params['roundNumber'] . ' (' .
                   max($this->params['roundScoreArray']) . ' vs. ' .
                   min($this->params['roundScoreArray']) . ')';
        return $message;
    }

    protected function friendly_message_attack() {
        $attackType = $this->params['attackType'];
        $preAttackDice = $this->params['preAttackDice'];
        $postAttackDice = $this->params['postAttackDice'];

        // First, what type of attack was this?
        if ($attackType == 'Pass') {
            $message = $this->outputPlayerIdNames[$this->actingPlayerId] . ' passed';
        } else {
            $message = $this->outputPlayerIdNames[$this->actingPlayerId] . ' performed ' . $attackType . ' attack';

            // Add the pre-attack status of all participating dice
            $preAttackAttackers = array();
            $preAttackDefenders = array();
            foreach ($preAttackDice['attacker'] as $idx => $attackerInfo) {
                $preAttackAttackers[] = $attackerInfo['recipeStatus'];
            }
            foreach ($preAttackDice['defender'] as $idx => $defenderInfo) {
                $preAttackDefenders[] = $defenderInfo['recipeStatus'];
            }
            if (count($preAttackAttackers) > 0) {
                $message .= ' using [' . implode(",", $preAttackAttackers) . ']';
            }
            if (count($preAttackDefenders) > 0) {
                $message .= ' against [' . implode(",", $preAttackDefenders) . ']';
            }

            // Report what happened to each defending die
            foreach ($preAttackDice['defender'] as $idx => $defenderInfo) {
                $postInfo = $postAttackDice['defender'][$idx];
                $postEvents = array();
                if ($postInfo['captured']) {
                    $postEvents[] = 'was captured';
                } else {
                    $postEvents[] = 'was not captured';
                    if ($defenderInfo['doesReroll']) {
                        $postEvents[] = 'rerolled ' . $defenderInfo['value'] . ' => ' . $postInfo['value'];
                    } else {
                        $postEvents[] = 'does not reroll';
                    }
                }
                if ($defenderInfo['recipe'] != $postInfo['recipe']) {
                    $postEvents[] = 'recipe changed from ' . $defenderInfo['recipe'] . ' to ' . $postInfo['recipe'];
                }
                $message .= '; Defender ' . $defenderInfo['recipe'] . ' ' . implode(', ', $postEvents);
            }

            // Report what happened to each attacking die
            foreach ($preAttackDice['attacker'] as $idx => $attackerInfo) {
                $postInfo = $postAttackDice['attacker'][$idx];
                $postEvents = array();
                if ($attackerInfo['doesReroll']) {
                    $postEvents[] = 'rerolled ' . $attackerInfo['value'] . ' => ' . $postInfo['value'];
                } else {
                    $postEvents[] = 'does not reroll';
                }
                if ($attackerInfo['recipe'] != $postInfo['recipe']) {
                    $postEvents[] = 'recipe changed from ' . $attackerInfo['recipe'] . ' to ' . $postInfo['recipe'];
                }
                if (count($postEvents) > 0) {
                    $message .= '; Attacker ' . $attackerInfo['recipe'] . ' ' . implode(', ', $postEvents);
                }
            }
        }
        return $message;
    }

    protected function friendly_message_choose_swing() {
        $message = $this->outputPlayerIdNames[$this->actingPlayerId] . ' set swing values';

	// If the round is later than the one in which this action
	// log entry was recorded, or we're no longer in swing selection
	// state, report the values which were chosen as well
        if (($this->outputRoundNumber != $this->params['roundNumber']) ||
            ($this->outputGameState != BMGameState::SPECIFY_DICE)) {
            $swingStrs = array();
            foreach ($this->params['swingValues'] as $swingType => $swingValue) {
                $swingStrs[] = $swingType . '=' . $swingValue;
            }
            $message .= ': ' . implode(", ", $swingStrs);
        }
        return $message;
    }

    public function __get($property) {
	if (property_exists($this, $property)) {
            switch ($property) {
                default:
                    return $this->$property;
            }
        }
    }

    public function __set($property, $value) {
        switch ($property) {
            default:
                $this->$property = $value;
        }
    }
}
