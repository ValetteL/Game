<?php

namespace App\Entity;

use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ORM\Entity(repositoryClass="App\Repository\BuildingRepository")
 */
class Building
{
    /**
     * @ORM\Id()
     * @ORM\GeneratedValue()
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\BuildingType", mappedBy="type")
     */
    private $buildingTypes;

    public function __construct()
    {
        $this->buildingTypes = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    /**
     * @return Collection|BuildingType[]
     */
    public function getBuildingTypes(): Collection
    {
        return $this->buildingTypes;
    }

    public function addBuildingType(BuildingType $buildingType): self
    {
        if (!$this->buildingTypes->contains($buildingType)) {
            $this->buildingTypes[] = $buildingType;
            $buildingType->setType($this);
        }

        return $this;
    }

    public function removeBuildingType(BuildingType $buildingType): self
    {
        if ($this->buildingTypes->contains($buildingType)) {
            $this->buildingTypes->removeElement($buildingType);
            // set the owning side to null (unless already changed)
            if ($buildingType->getType() === $this) {
                $buildingType->setType(null);
            }
        }

        return $this;
    }
}
