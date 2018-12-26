<?php

namespace App\Command;

use App\Server\Server;
use Ratchet\Http\HttpServer;
use Ratchet\Server\IoServer;
use Ratchet\WebSocket\WsServer;
use Symfony\Component\Console\Command\Command;
use Symfony\Component\Console\Input\InputInterface;
use Symfony\Component\Console\Output\OutputInterface;

class GameServerCommand extends Command
{
    protected static $defaultName = 'app:game-server';

    protected function configure()
    {
        $this
            ->setDescription('Start game Websocket Server')
        ;
    }

    protected function execute(InputInterface $input, OutputInterface $output)
    {
        $output->writeln([
            'Lancement du Serveur de WebSocket ! ',
            'Serveur en ligne...'
        ]);

        $server = IoServer::factory(
            new HttpServer(new WsServer(new Server())),
            8001,
            '127.0.0.1'
        );
        $server->run();
        $output->writeln([
            'Arret du Serveur'
        ]);
    }
}
