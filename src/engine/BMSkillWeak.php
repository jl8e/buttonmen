<?php
/**
 * BMSkillWeak: Code specific to the weak die skill
 *
 * @author james
 */

/**
 * This class contains code specific to the weak die skill
 */
class BMSkillWeak extends BMSkill {
    public static $hooked_methods = array('pre_roll');

    public static function pre_roll($args) {
        $die = $args['die'];
        $die->shrink();
    }

    protected static function get_description() {
        return 'When a Weak Die rerolls for any reason, it becomes smaller. ' .
               'A 31+ sided die shrinks to a 30 sided die, then down to a ' .
               '20, 16, 12, 10, 8, 6, 4, 2, and finally a 1 sided die.';
    }

    protected static function get_interaction_descriptions() {
        return array();
    }

    public static function prevents_win_determination() {
        return TRUE;
    }
}
