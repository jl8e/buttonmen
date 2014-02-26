<?php

class BMGameActionTest extends PHPUnit_Framework_TestCase {

    /**
     * @var BMGameAction
     */
    protected $object;

    /**
     * Sets up the fixture, for example, opens a network connection.
     * This method is called before a test is executed.
     */
    protected function setUp() {
        $this->playerIdNames = array(1 => "gameaction01", 2 => "gameaction02");
    }

    /**
     * Tears down the fixture, for example, closes a network connection.
     * This method is called after a test is executed.
     */
    protected function tearDown() {
    }

    /**
     * @covers BMGameAction::__construct()
     */
    public function test_construct() {
        $attackStr = "performed Power attack using [(X):1] against [(4):1]; Defender (4) was captured; Attacker (X) rerolled 1 => 2";
        $this->object = new BMGameAction(40, 'attack', 1, $attackStr);
        $this->assertEquals($this->object->gameState, 40);
        $this->assertEquals($this->object->actionType, 'attack');
        $this->assertEquals($this->object->actingPlayerId, 1);
        $this->assertEquals($this->object->params, $attackStr);
    }

    /**
     * @covers BMGameAction::friendly_message()
     */
    public function test_friendly_message() {
        $attackStr = "performed Power attack using [(X):1] against [(4):1]; Defender (4) was captured; Attacker (X) rerolled 1 => 2";
        $this->object = new BMGameAction(40, 'attack', 1, $attackStr);
        $this->assertEquals(
            $this->object->friendly_message($this->playerIdNames, 0, 0),
            "gameaction01 performed Power attack using [(X):1] against [(4):1]; Defender (4) was captured; Attacker (X) rerolled 1 => 2"
        );
    }

    /**
     * @covers BMGameAction::friendly_message_end_draw()
     */
    public function test_friendly_message_end_draw() {
        $this->object = new BMGameAction(50, 'end_draw', 0, array('roundNumber' => 2, 'roundScoreArray' => array(23, 23)));
        $this->assertEquals(
            $this->object->friendly_message($this->playerIdNames, 0, 0),
            "Round 2 ended in a draw (23 vs. 23)"
        );
    }

    /**
     * @covers BMGameAction::friendly_message_end_winner()
     */
    public function test_friendly_message_end_winner() {
        $this->object = new BMGameAction(50, 'end_winner', 2, array('roundNumber' => 1, 'roundScoreArray' => array(24, 43)));
        $this->assertEquals(
            $this->object->friendly_message($this->playerIdNames, 0, 0),
            "End of round: gameaction02 won round 1 (43 vs. 24)"
        );
    }

    /**
     * @covers BMGameAction::friendly_message_attack()
     */
    public function test_friendly_message_attack() {
        $this->object = new BMGameAction(40, 'attack', 1, array(
            'attackType' => 'Power',
            'preAttackDice' => array(
                'attacker' => array(
                    array('recipe' => '(4)', 'min' => 1, 'max' => 4, 'value' => 3, 'doesReroll' => TRUE, 'captured' => FALSE, 'recipeStatus' => '(4):3'),
                ),
                'defender' => array(
                    array('recipe' => '(10)', 'min' => 1, 'max' => 10, 'value' => 1, 'doesReroll' => TRUE, 'captured' => FALSE, 'recipeStatus' => '(10):1'),
                ),
            ),
            'postAttackDice' => array(
                'attacker' => array(
                    array('recipe' => '(4)', 'min' => 1, 'max' => 4, 'value' => 2, 'doesReroll' => TRUE, 'captured' => FALSE, 'recipeStatus' => '(4):2'),
                ),
                'defender' => array(
                    array('recipe' => '(10)', 'min' => 1, 'max' => 10, 'value' => 1, 'doesReroll' => TRUE, 'captured' => TRUE, 'recipeStatus' => '(10):1'),
                ),
            )
        ));
        $this->assertEquals(
            $this->object->friendly_message($this->playerIdNames, 0, 0),
            "gameaction01 performed Power attack using [(4):3] against [(10):1]; Defender (10) was captured; Attacker (4) rerolled 3 => 2"
        );
    }

    public function test_friendly_message_choose_swing() {
        $this->object = new BMGameAction(24, 'choose_swing', 1, array('roundNumber' => 1, 'swingValues' => array('X' => 5, 'Y' => 13)));
        $this->assertEquals(
            $this->object->friendly_message($this->playerIdNames, 2, 24),
            "gameaction01 set swing values: X=5, Y=13"
        );
        $this->assertEquals(
            $this->object->friendly_message($this->playerIdNames, 1, 24),
            "gameaction01 set swing values"
        );
    }
}

?>
